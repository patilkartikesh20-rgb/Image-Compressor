const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { PDFDocument } = require('pdf-lib'); 
const cors = require('cors');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.static('public'));

app.post('/compress', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false });

        const quality = parseInt(req.body.quality);
        const originalSize = req.file.size;
        let buffer;
        let finalMimeType = req.file.mimetype;

        // CHECK IF IT'S A PDF
        if (req.file.mimetype === 'application/pdf') {
            const pdfDoc = await PDFDocument.load(req.file.buffer);
            
            buffer = Buffer.from(await pdfDoc.save({ 
                useObjectStreams: true,
                addDefaultFont: false 
            }));
        } 
        
        else {
            let pipeline = sharp(req.file.buffer);
            const metadata = await pipeline.metadata();

            if (metadata.format === 'png') {
                pipeline = pipeline.png({ quality: quality, palette: true });
            } else {
                pipeline = pipeline.jpeg({ quality: quality, mozjpeg: true });
            }
            buffer = await pipeline.toBuffer();
            finalMimeType = `image/${metadata.format}`;
        }

        res.json({
            success: true,
            originalSize: (originalSize / 1024).toFixed(1) + " KB",
            compressedSize: (buffer.length / 1024).toFixed(1) + " KB",
            savings: (((originalSize - buffer.length) / originalSize) * 100).toFixed(0) + "%",
            imageData: `data:${finalMimeType};base64,${buffer.toString('base64')}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});