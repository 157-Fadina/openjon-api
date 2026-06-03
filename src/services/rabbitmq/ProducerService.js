const amqp = require('amqplib');

const ProducerService = {
  sendMessage: async (queue, message) => {
    const url = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
    
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    
    await channel.assertQueue(queue, { durable: true });
    await channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = ProducerService;