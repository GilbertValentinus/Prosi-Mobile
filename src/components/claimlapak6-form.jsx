import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ClaimForm6() {
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setSelectedFile(URL.createObjectURL(e.target.files[0]));
  };

  const handleNext = () => {
    console.log('Foto yang dipilih:', selectedFile);
    navigate('/');
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Klaim Lapak</h2>
      <p style={styles.subtitle}>Tambahkan foto lapak anda</p>

      <div style={styles.photoContainer}>
        {selectedFile ? (
          <div style={styles.imageWrapper}>
            <img src={selectedFile} alt="Lapak" style={styles.image} />
            <button onClick={handleRemovePhoto} style={styles.removeButton}>X</button>
          </div>
        ) : (
          <label htmlFor="upload-photo" style={styles.uploadButton}>
            Tambahkan Foto
          </label>
        )}
        <input
          type="file"
          id="upload-photo"
          onChange={handleFileChange}
          style={styles.fileInput}
        />
      </div>

      <button onClick={handleNext} style={styles.button}>
        Lanjutkan
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#1A1B29',
    color: '#FFFFFF',
    height: '100vh',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    marginBottom: '20px',
  },
  photoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '300px',
  },
  image: {
    width: '100%',
    borderRadius: '10px',
  },
  removeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: '#FF4D4D',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    color: '#FFFFFF',
    cursor: 'pointer',
  },
  uploadButton: {
    padding: '10px',
    backgroundColor: '#6772E5',
    color: '#FFFFFF',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'inline-block',
    marginBottom: '10px',
  },
  fileInput: {
    display: 'none',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#6772E5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default ClaimForm6;
