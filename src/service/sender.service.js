//a fake task described by Hello... will take three seconds.
//docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management to start the rabbitmq server in docker container

import amqp from "amqplib/callback_api"

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }

        let queue = 'task_queue';
        let msg = process.argv.slice(2).join(' ') || "Hello World!";

        channel.assertQueue(queue, {
            durable: true // make sure that the queue won't be lost if the RabbitMQ server crashes, it stores the queue on disk actually it store in the catch memory by default
        });
        channel.sendToQueue(queue, Buffer.from(msg), {
            persistent: true // make sure that the message won't be lost if the RabbitMQ server crashes
        });
        console.log(" [x] Sent '%s'", msg);
        setTimeout(function () {
            connection.close();
            process.exit(0);
        }, 500);
    });
});