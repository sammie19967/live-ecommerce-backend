import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import upload from '../config/multerConfig.js'; // Import Multer configuration

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Improved API Route for File Uploads
router.post('/upload', upload.array('files', 10), (req, res) => {
    console.log("🔄 File Upload Request Received");
    console.log("📂 Files:", req.files); // Log uploaded files
    console.log("📜 Body:", req.body);   // Log request body

    if (!req.files || req.files.length === 0) {
        console.warn("⚠️ No files uploaded");
        return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ fileUrls });
});

// Serve uploaded files as static assets
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API route to retrieve all uploaded files
router.get('/uploads', (req, res) => {
    const directoryPath = path.join(__dirname, '../uploads');

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ message: "Error reading files." });
        }
        const fileUrls = files.map(file => `http://localhost:5000/uploads/${file}`);
        res.json({ fileUrls });
    });
});
router.delete("/:filename", (req, res) => {
    const filePath = path.join(__dirname, "../uploads", req.params.filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting file." });
        }
        res.json({ message: "File deleted successfully." });
    });
});



export default router;