import amqp from "amqplib/callback_api"

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'task_queue';

        channel.assertQueue(queue, {
            durable: true
        });

        channel.prefetch(1); // make sure one worker handles one message at a time

        channel.consume(queue, function (msg) {

            if (msg === null) return; // safety check if consumer is cancelled

            var secs = msg.content.toString().split('.').length - 1;

            console.log(" [x] Received %s", msg.content.toString());
            setTimeout(function () {
                channel.ack(msg); // acknowledge the message to the server
                console.log(" [x] Done");
            }, secs * 1000);
        }, {
            noAck: false // make sure that the message won't be lost if the worker dies before processing the message,
            // so we need to send an acknowledgment to the server after processing the message
        });
    });
});
