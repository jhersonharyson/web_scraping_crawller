const { Server } = require("./src/bin/server");

// const { Kafka } = require("kafkajs");

// const kafka = new Kafka({
//   clientId: "my-app",
//   brokers: ["192.168.99.100:9092"]
// });

// const producer = kafka.producer();

const server = new Server({ initializer: true, kafka_producer: false });

// const run = async () => {
//   await producer.connect();
//   server.start();
// };

// run().catch(console.error);
