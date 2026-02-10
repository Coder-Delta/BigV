import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Port
const port = process.env.PORT || 3000;

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Export app for testing or reuse
export { app };
