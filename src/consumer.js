require('dotenv').config();
const amqp = require('amqplib');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const init = async () => {
  const pool = new Pool();
  
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const url = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  const queue = 'job_applications';

  await channel.assertQueue(queue, { durable: true });
  console.log(`[Consumer] Menunggu pesan di antrean '${queue}'...`);

  channel.consume(queue, async (message) => {
    try {
      if (message !== null) {
        const { application_id } = JSON.parse(message.content.toString());
        console.log(`\n[Consumer] Memproses lamaran ID: ${application_id}`);

        const queryApp = {
          text: `SELECT a.created_at, u.name AS pelamar_name, u.email AS pelamar_email, j.title AS job_title
                 FROM applications a
                 JOIN users u ON a.user_id = u.id
                 JOIN jobs j ON a.job_id = j.id
                 WHERE a.id = $1`,
          values: [application_id],
        };
        const resultApp = await pool.query(queryApp);

        if (resultApp.rows.length > 0) {
          const appData = resultApp.rows[0];
          const ownerQuery = await pool.query('SELECT email FROM users LIMIT 1');
          const jobOwnerEmail = ownerQuery.rows[0].email;

          const mailOptions = {
            from: 'OpenJob System <no-reply@openjob.com>',
            to: jobOwnerEmail,
            subject: `Notifikasi Lamaran Baru: ${appData.job_title}`,
            html: `
              <h2>Halo, ada pelamar baru untuk lowongan ${appData.job_title}!</h2>
              <p>Berikut adalah detail kandidat yang melamar:</p>
              <ul>
                <li><strong>Nama Pelamar:</strong> ${appData.pelamar_name}</li>
                <li><strong>Email Pelamar:</strong> ${appData.pelamar_email}</li>
                <li><strong>Tanggal Lamaran:</strong> ${new Date(appData.created_at).toLocaleString('id-ID')}</li>
              </ul>
              <p>Mohon segera diperiksa di sistem OpenJob Anda.</p>
            `,
          };

          await transporter.sendMail(mailOptions);
          console.log(`[Consumer] Sukses! Email terkirim ke Pemilik Lowongan (${jobOwnerEmail})`);
        }

        channel.ack(message);
      }
    } catch (error) {
      console.error('[Consumer] Gagal memproses:', error);
    }
  });
};

init();