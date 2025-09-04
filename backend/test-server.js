const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5003;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running!' });
});

app.listen(PORT, () => {
  console.log(`[INFO] Test server running on port ${PORT}`);
  console.log(`[INFO] Health check: http://localhost:${PORT}/health`);
});
