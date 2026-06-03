const amqp = require('amqplib');

const ProducerService = {
  sendMessage: async (queue, message) => {
    try {
      // Merangkai koneksi menggunakan kredensial dari file .env
      const connection = await amqp.connect({
        hostname: process.env.RABBITMQ_HOST, // Sesuai .env
        port: process.env.RABBITMQ_PORT,     // Sesuai .env
        username: process.env.RABBITMQ_USER, // Sesuai .env
        password: process.env.RABBITMQ_PASSWORD, // Sesuai .env
      });
      
      const channel = await connection.createChannel();
      
      await channel.assertQueue(queue, {
        durable: true,
      });

      await channel.sendToQueue(queue, Buffer.from(message));

      setTimeout(() => {
        connection.close();
      }, 1000);
    } catch (error) {
      console.error('Gagal mengirim ke RabbitMQ:', error);
      throw error;
    }
  },
};

module.exports = ProducerService;