const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { Schema } = mongoose;

const app = express();
const port = 3500;

// Connect to MongoDB
mongoose.connect('mongodb+srv://samar0486:samar0486@allbackends.xm3hwao.mongodb.net/lll', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a schema and model for the image
const imageSchema = new Schema({
  name: String,
  data: Buffer,
  contentType: String
});

const Image = mongoose.model('Image', imageSchema);

// Set up multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Enable CORS for all routes
app.use(cors());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/imageUpload', upload.single('image'), (req, res) => {
  const { file } = req;
  const { name } = req.body;

  if (!file) {
    return res.status(400).send('No file uploaded');
  }

  const newImage = new Image({
    name: name,
    data: file.buffer,
    contentType: file.mimetype
  });

  newImage.save()
    .then(image => res.status(201).json({ id: image._id }))
    .catch(err => res.status(500).send('Error uploading image'));
});

app.get('/imagesGet/:id', (req, res) => {
  const { id } = req.params;

  Image.findById(id)
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
    const images = await Image.find();
    res.json(images);
  } catch (err) {
    res.status(500).send('Error fetching images');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
