const express = require("express");
const cors = require("cors");
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
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "uploads"))); // Static for uploaded files

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/instances', instanceRoutes);
app.use('/api/objects', objectRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/migrations', migrationRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/timeline', timelineRoutes);

// Serve React/SPA build (optional - only if you build frontend here)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
}

// Error handler
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
