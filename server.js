const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static('public'));

app.post('/compress', upload.single('image'), async (req, res) => {
    try {
        const quality = parseInt(req.body.quality);
        const originalSize = req.file.size;

        
        let pipeline = sharp(req.file.buffer);
        const metadata = await pipeline.metadata();

        if (metadata.format === 'png') {
            
            pipeline = pipeline.png({ quality: quality, compressionLevel: 9 });
        } else {
            
            pipeline = pipeline.jpeg({ quality: quality, mozjpeg: true });
        }

        const buffer = await pipeline.toBuffer();

        res.json({
            success: true,
            originalSize: (originalSize / 1024).toFixed(1) + " KB",
            compressedSize: (buffer.length / 1024).toFixed(1) + " KB",
            savings: (((originalSize - buffer.length) / originalSize) * 100).toFixed(0) + "%",
            imageData: `data:image/${metadata.format};base64,${buffer.toString('base64')}`
        });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`NoWhere running on http://localhost:${PORT}`));
