import amqp from "amqplib/callback_api.js";
import { exec } from "child_process";

const QUEUE = "task_queue";
const RABBIT_URL = "amqp://127.0.0.1";

function run(command) {
  return new Promise((resolve, reject) => {
    exec(command, { shell: true }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Convert Windows path → POSIX path for bash
function toPosixPath(p) {
  return p.replace(/\\/g, "/");
}

amqp.connect(RABBIT_URL, (error0, connection) => {
  if (error0) throw error0;

  connection.createChannel((error1, channel) => {
    if (error1) throw error1;

    channel.assertQueue(QUEUE, { durable: true });
    channel.prefetch(1);

    console.log("Worker started. Waiting for jobs...");

    channel.consume(
      QUEUE,
      async (msg) => {
        if (!msg) return;

        let job;
        try {
          job = JSON.parse(msg.content.toString());
        } catch {
          console.error("Invalid JSON payload");
          channel.ack(msg);
          return;
        }

        let { videoPath, baseName } = job;

        // IMPORTANT: normalize path for bash
        videoPath = toPosixPath(videoPath);

        console.log("Job received:", { videoPath, baseName });

        try {
          await run(`bash -lc "src/service/videoConvert.sh '${videoPath}'"`);
          await run(`bash -lc "src/service/videoPackagingHLS.sh '${baseName}'"`);

          channel.ack(msg);
          console.log("Job completed:", baseName);
        } catch (err) {
          console.error("Job failed:", err);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  });
});
