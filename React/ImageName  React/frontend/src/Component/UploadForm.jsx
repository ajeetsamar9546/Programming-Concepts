import React, { useEffect, useState } from 'react';

const UploadForm = () => {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [galleryImages, setGalleryImages] = useState([]);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('image', image);

        fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                setUploadedImageUrl(`http://localhost:5000/${data.imagePath}`);
            })
            .catch(error => {
                console.error('There was an error uploading the image!', error);
            });
    };

    const fetchImages = async () => {
        try {
            const response = await fetch('http://localhost:5000/imagesGet');
            if (!response.ok) {
                throw new Error('Failed to fetch images');
            }
            const images = await response.json();
            setGalleryImages(images);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <label>Image:</label>
                    <input type="file" onChange={handleImageChange} />
                </div>
                <button type="submit">Upload</button>
            </form>

            <div>
                <h2>Uploaded Image</h2>
                {uploadedImageUrl && (
                    <img
                        id="uploadedImage"
                        src={uploadedImageUrl}
                        alt="Uploaded Image"
                        style={{ marginTop: '20px', maxWidth: '100%', maxHeight: '400px' }}
                    />
                )}

                <h2>Gallery</h2>
                <div id="gallery" className="gallery">
                    {galleryImages.map((image) => (
                        <div key={image._id}>
                            <img
                                src={`http://localhost:5000/imagesGet/${image._id}`}
                                alt={image.name}
                                style={{ margin: '10px', maxWidth: '200px', maxHeight: '200px' }}
                            />
                            <p>{image.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UploadForm
