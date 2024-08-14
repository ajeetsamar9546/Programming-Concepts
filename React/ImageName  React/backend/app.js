const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://samar0486:samar0486@allbackends.xm3hwao.mongodb.net/React_ImgNam', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Create a Mongoose schema
const uploadSchema = new mongoose.Schema({
    name: String,
    data: Buffer,
    contentType: String
});

const Upload = mongoose.model('Upload', uploadSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to handle form submission
app.post('/upload', upload.single('image'), (req, res) => {
    const { file } = req;
    const { name } = req.body;
  
    if (!file) {
      return res.status(400).send('No file uploaded');
    }
  
    const newImage = new Upload({
      name: name,
      data: file.buffer,
      contentType: file.mimetype
    });

    newImage.save()
        .then((savedImage) => res.status(200).json({ message: 'Upload successful!', imagePath: `imagesGet/${savedImage._id}` }))
        .catch(err => {
            console.error('Error saving to MongoDB:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

app.get('/imagesGet/:id', (req, res) => {
    const { id } = req.params;

    Upload.findById(id)
        .then(image => {
            if (!image) {
                return res.status(404).send('Image not found');
            }

            res.set('Content-Type', image.contentType);
            res.send(image.data);
        })
        .catch(err => res.status(500).send('Error fetching image'));
});

app.get('/imagesGet', async (req, res) => {
    try {
        const images = await Upload.find();
        res.json(images);
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
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
