const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const path = require("path");
const multer = require("multer");
const upload = multer();
// Import routes
const instanceRoutes = require('./routes/instanceRoutes');
const objectRoutes = require('./routes/objectRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const migrationRoutes = require('./routes/migrationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "150mb" })); // Increase limit for large files
app.use(express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(upload.any())

// Simple health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
// Routes
app.use('/api/instances', instanceRoutes);
app.use('/api/objects', objectRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/migrations', migrationRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/timeline', timelineRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: true,
        message: err.message || 'Something went wrong on the server'
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
