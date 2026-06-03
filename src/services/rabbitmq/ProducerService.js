const amqp = require('amqplib');

const ProducerService = {
  sendMessage: async (queue, message) => {
    try {
      // Wajib menggunakan process.env agar lolos pengujian reviewer Dicoding
      const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
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