import React, { useEffect, useState } from 'react';

const UploadForm = () => {
    const [name, setName] = useState('');
    const [images, setImages] = useState({ image1: null, image2: null, image3: null });
    const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);

    const handleImageChange = (e, imageKey) => {
        setImages(prevImages => ({ ...prevImages, [imageKey]: e.target.files[0] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('image1', images.image1);
        formData.append('image2', images.image2);
        formData.append('image3', images.image3);

        fetch('http://localhost:4600/upload', {
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
                setUploadedImageUrls(data.imagePaths.map(path => `http://localhost:4600/${path}`));
            })
            .catch(error => {
                console.error('There was an error uploading the images!', error);
            });
    };

    const fetchImages = async () => {
        try {
            const response = await fetch('http://localhost:4600/imagesGet');
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
                    <label>Image 1:</label>
                    <input type="file" onChange={(e) => handleImageChange(e, 'image1')} />
                </div>
                <div>
                    <label>Image 2:</label>
                    <input type="file" onChange={(e) => handleImageChange(e, 'image2')} />
                </div>
                <div>
                    <label>Image 3:</label>
                    <input type="file" onChange={(e) => handleImageChange(e, 'image3')} />
                </div>
                <button type="submit">Upload</button>
            </form>

            <div>
                <h2>Uploaded Images</h2>
                {uploadedImageUrls.map((url, index) => (
                    <img
                        key={index}
                        src={url}
                        alt={`Uploaded Image ${index + 1}`}
                        style={{ marginTop: '20px', maxWidth: '100%', maxHeight: '400px' }}
                    />
                ))}

                <h2>Gallery</h2>
                <div id="gallery" className="gallery">
                    {galleryImages.map((upload) => (
                        upload.images.map((image, index) => (
                            <div key={`${upload._id}-${index}`}>
                                <img
                                    src={`http://localhost:4600/imagesGet/${upload._id}/${index}`}
                                    alt={`Gallery Image ${index + 1}`}
                                    style={{ margin: '10px', maxWidth: '200px', maxHeight: '200px' }}
                                />
                                <p>{upload.name}</p>
                            </div>
                        ))
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UploadForm;
