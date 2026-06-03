const amqp = require('amqplib');

const ProducerService = {
  sendMessage: async (queue, message) => {
    try {
      const connection = await amqp.connect({
        hostname: process.env.RABBITMQ_HOST, 
        port: process.env.RABBITMQ_PORT,     
        username: process.env.RABBITMQ_USER, 
        password: process.env.RABBITMQ_PASSWORD, 
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