import fs from "fs";
import path from "path";
import amqp from "amqplib/callback_api.js";
import { fileURLToPath } from "url";

/* Resolve project root safely */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..");

/* RabbitMQ */
const RABBIT_URL = "amqp://127.0.0.1";
const QUEUE = "task_queue";

/* Video directory (absolute) */
const VIDEO_DIR = path.join(ROOT_DIR, "public", "vid");

/* Allowed extensions */
const VIDEO_EXT = [".mp4", ".mkv", ".mov", ".webm"];

function getVideos(dir) {
    if (!fs.existsSync(dir)) {
        throw new Error(`Video directory not found: ${dir}`);
    }

    return fs.readdirSync(dir)
        .filter(f => VIDEO_EXT.includes(path.extname(f).toLowerCase()))
        .map(f => path.join("public", "vid", f)); // relative path for worker
}

amqp.connect(RABBIT_URL, (err0, connection) => {
    if (err0) throw err0;

    connection.createChannel((err1, channel) => {
        if (err1) throw err1;

        channel.assertQueue(QUEUE, { durable: true });

        const videos = getVideos(VIDEO_DIR);

        if (videos.length === 0) {
            console.log("No videos found in public/vid");
            process.exit(0);
        }

        for (const videoPath of videos) {
            const baseName = path.basename(videoPath, path.extname(videoPath));

            const job = {
                videoPath,
                baseName,
                task: "video_convert_hls",
                createdAt: Date.now()
            };

            channel.sendToQueue(
                QUEUE,
                Buffer.from(JSON.stringify(job)),
                { persistent: true }
            );

            console.log("Job queued:", job);
        }

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    });
});
