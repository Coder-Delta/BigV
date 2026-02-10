## Video Management & Streaming System

This project is a scalable video processing and streaming backend designed for efficient media delivery.

Videos are transcoded into multiple resolutions using FFmpeg to optimize bandwidth usage. Adaptive Bitrate Streaming (ABR) is implemented using HLS, packaged with Google Shaka Packager to ensure smooth playback across varying network conditions.

To handle CPU-intensive video processing without blocking the main application, RabbitMQ work queues are used. Video processing tasks are executed asynchronously by worker services, enabling horizontal scalability and improved system reliability.

### Features
- Multi-resolution video transcoding using FFmpeg  
- Adaptive Bitrate Streaming (ABR) with HLS  
- HLS packaging via Google Shaka Packager  
- Asynchronous video processing using RabbitMQ work queues  
- Scalable and non-blocking backend architecture
