const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://samar0486:samar0486@allbackends.xm3hwao.mongodb.net/React_ImgN', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Create a Mongoose schema
const uploadSchema = new mongoose.Schema({
    name: String,
    images: [{
        data: Buffer,
        contentType: String
    }]
});

const Upload = mongoose.model('Upload', uploadSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to handle form submission
app.post('/upload', upload.fields([{ name: 'image1' }, { name: 'image2' }, { name: 'image3' }]), (req, res) => {
    const { files } = req;
    const { name } = req.body;

    if (!files || Object.keys(files).length === 0) {
        return res.status(400).send('No files uploaded');
    }

    const images = Object.values(files).map(fileArray => ({
        data: fileArray[0].buffer,
        contentType: fileArray[0].mimetype
    }));

    const newImages = new Upload({
        name,
        images
    });

    newImages.save()
        .then(savedImages => res.status(200).json({ message: 'Upload successful!', imagePaths: savedImages.images.map((_, index) => `imagesGet/${savedImages._id}/${index}`) }))
        .catch(err => {
            console.error('Error saving to MongoDB:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

app.get('/imagesGet/:id/:index', (req, res) => {
    const { id, index } = req.params;

    Upload.findById(id)
        .then(upload => {
            if (!upload || !upload.images[index]) {
                return res.status(404).send('Image not found');
            }

            const image = upload.images[index];
            res.set('Content-Type', image.contentType);
            res.send(image.data);
        })
        .catch(err => res.status(500).send('Error fetching image'));
});

app.get('/imagesGet', async (req, res) => {
    try {
        const uploads = await Upload.find();
        res.json(uploads);
    } catch (err) {
        res.status(500).send('Error fetching images');
    }
});

// Error handling middleware
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Server Error' });
});

// Start the server
const PORT = 4600;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
