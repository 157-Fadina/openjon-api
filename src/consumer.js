require('dotenv').config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');

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

  const connection = await amqp.connect({
    hostname: process.env.RABBITMQ_HOST,
    port: process.env.RABBITMQ_PORT,
    username: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
  });
  
  const channel = await connection.createChannel();
  const queue = 'job_applications'; 
  
  await channel.assertQueue(queue, {
    durable: true,
  });

  console.log(`Consumer berjalan dan menunggu pesan di queue: ${queue}...`);

  channel.consume(queue, async (message) => {
    if (message !== null) {
      try {
        const { application_id } = JSON.parse(message.content.toString());

        const query = `
          SELECT 
            u_applicant.email AS applicant_email,
            u_applicant.name AS applicant_name,
            a.created_at AS application_date,
            j.title AS job_title,
            u_owner.email AS owner_email
          FROM applications a
          JOIN users u_applicant ON a.user_id = u_applicant.id
          JOIN jobs j ON a.job_id = j.id
          JOIN companies c ON j.company_id = c.id
          JOIN users u_owner ON c.owner_id = u_owner.id
          WHERE a.id = $1
        `;
        
        const result = await pool.query(query, [application_id]);
        const data = result.rows[0];

        if (data) {
          const mailOptions = {
            from: 'OpenJob System <no-reply@openjob.id>',
            to: data.owner_email,
            subject: `Pemberitahuan: Lamaran Baru untuk ${data.job_title}`,
            html: `
              <div style="background-color: #121212; color: #e0e0e0; font-family: 'Courier New', Courier, monospace; padding: 40px; border: 4px solid #FF00FF; box-shadow: 6px 6px 0px #00FFFF;">
                <h1 style="color: #00FFFF; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px #FF00FF;">⚡ KANDIDAT BARU ⚡</h1>
                <p style="font-size: 16px; line-height: 1.5;">Halo! Ada kandidat baru yang masuk untuk posisi <strong>${data.job_title}</strong> yang kamu pasang.</p>
                <div style="background-color: #1e1e1e; padding: 20px; border-left: 5px solid #00FFFF; margin: 25px 0;">
                  <p style="margin: 5px 0;"><strong>Nama Pelamar:</strong> ${data.applicant_name}</p>
                  <p style="margin: 5px 0;"><strong>Email Pelamar:</strong> <a href="mailto:${data.applicant_email}" style="color: #FF00FF;">${data.applicant_email}</a></p>
                  <p style="margin: 5px 0;"><strong>Tanggal Lamaran:</strong> ${new Date(data.application_date).toLocaleString('id-ID')}</p>
                </div>
                <p style="font-size: 14px; color: #aaaaaa; margin-top: 30px;">// OpenJob Automated System //</p>
              </div>
            `,
          };

          await transporter.sendMail(mailOptions);
          console.log(`[V] Sukses mengirim notifikasi email ke: ${data.owner_email}`);
        }

        channel.ack(message);
      } catch (error) {
        console.error('Gagal memproses pesan:', error.message);
      }
    }
  });
};

init();