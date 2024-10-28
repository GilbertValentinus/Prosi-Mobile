import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react'; // Import icon X dari lucide-react

function ClaimLapak() {
  const [formData, setFormData] = useState({
    namaLapak: '',
    kategoriLapak: '',
    alamat: '',
    latitude: '',
    longitude: '',
    telepon: '',
    deskripsiLapak: '',
    situs: '',
    layanan: '',
    selectedFile: null,
    previewUrl: null,
    jamBuka: {}
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const selectedLocation = JSON.parse(localStorage.getItem('selectedLocation'));
    if (selectedLocation?.address) {
      setFormData(prev => ({
        ...prev,
        alamat: selectedLocation.address,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude
      }));
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        selectedFile: file,
        previewUrl: URL.createObjectURL(file)
      }));
    }
  };

  const handleDeleteImage = () => {
    if (formData.previewUrl) {
      URL.revokeObjectURL(formData.previewUrl); // Clean up the URL object
    }
    setFormData(prev => ({
      ...prev,
      selectedFile: null,
      previewUrl: null
    }));
    // Reset file input
    const fileInput = document.getElementById('upload-photo');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleToggleOpen = (day) => {
    setFormData(prev => ({
      ...prev,
      jamBuka: {
        ...prev.jamBuka,
        [day]: {
          ...prev.jamBuka[day],
          buka: !prev.jamBuka[day]?.buka,
          jamBuka: '',
          jamTutup: ''
        }
      }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      jamBuka: {
        ...prev.jamBuka,
        [day]: {
          ...prev.jamBuka[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const userResponse = await fetch('http://localhost:8080/api/user', { credentials: 'include' });
      const userData = await userResponse.json();
      const userId = userData?.user?.id_pengguna;
  
      if (!userId) {
        throw new Error('User not logged in');
      }
  
      const formDataToSend = new FormData();
  
      formDataToSend.append('userId', userId);
  
      Object.keys(formData).forEach(key => {
        if (key !== 'selectedFile' && key !== 'previewUrl' && key !== 'jamBuka') {
          formDataToSend.append(key, formData[key]);
        }
      });
  
      const jamBukaArray = Object.keys(formData.jamBuka).map(day => ({
        hari: day,
        buka: formData.jamBuka[day].buka,
        jamBuka: formData.jamBuka[day].jamBuka,
        jamTutup: formData.jamBuka[day].jamTutup
      }));
      formDataToSend.append('jamBuka', JSON.stringify(jamBukaArray));
  
      if (formData.selectedFile) {
        formDataToSend.append('foto', formData.selectedFile);
      }
  
      const response = await fetch('http://localhost:8080/api/claim-lapak', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      });
  
      const data = await response.json();
  
      if (data.success) {
        alert('Data lapak berhasil disimpan!');
        navigate('/lapak');
      } else {
        throw new Error(data.message || 'Failed to save data');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Gagal mengirim data ke server');
    }
  };

  return (
    <div style={styles.formContainer}>
      <Link to="/" className="mr-4">
        <ArrowLeft className="w-6 h-6" />
      </Link>
      <h2 style={styles.title}>Claim Lapak</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.inputContainer}>
          <label style={styles.label}>Nama lapak</label>
          <input
            type="text"
            name="namaLapak"
            value={formData.namaLapak}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.label}>Kategori Lapak</label>
          <select
            name="kategoriLapak"
            value={formData.kategoriLapak}
            onChange={handleChange}
            style={styles.select}
            required
          >
            <option value="">Pilih Kategori</option>
            <option value="warung">Warung</option>
            <option value="kaki lima">Kaki Lima</option>
            <option value="cafe">Cafe</option>
          </select>
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.label}>Alamat</label>
          <input
            type="text"
            name="alamat"
            value={formData.alamat}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.label}>Latitude</label>
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            style={styles.input}
            readOnly
          />
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.label}>Longitude</label>
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            style={styles.input}
            readOnly
          />
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.label}>No. Telepon</label>
          <input
            type="tel"
            name="telepon"
            value={formData.telepon}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => (
          <div key={day} style={styles.dayRow}>
            <label style={styles.label}>{day}</label>
            <input
              type="checkbox"
              checked={formData.jamBuka[day]?.buka || false}
              onChange={() => handleToggleOpen(day)}
            />
            <input
              type="time"
              value={formData.jamBuka[day]?.jamBuka || ''}
              onChange={(e) => handleTimeChange(day, 'jamBuka', e.target.value)}
              disabled={!formData.jamBuka[day]?.buka}
              style={styles.input}
            />
            <input
              type="time"
              value={formData.jamBuka[day]?.jamTutup || ''}
              onChange={(e) => handleTimeChange(day, 'jamTutup', e.target.value)}
              disabled={!formData.jamBuka[day]?.buka}
              style={styles.input}
            />
          </div>
        ))}

        <div style={styles.inputContainer}>
          <label style={styles.label}>Deskripsi lapak</label>
          <textarea
            name="deskripsiLapak"
            value={formData.deskripsiLapak}
            onChange={handleChange}
            style={{ ...styles.input, minHeight: '100px' }}
          />
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.label}>Situs</label>
          <input
            type="text"
            name="situs"
            value={formData.situs}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.label}>Layanan</label>
          <input
            type="text"
            name="layanan"
            value={formData.layanan}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.imageContainer}>
          {formData.previewUrl ? (
            <div style={styles.previewContainer}>
              <img src={formData.previewUrl} alt="Preview" style={styles.image} />
              <button
                type="button"
                onClick={handleDeleteImage}
                style={styles.deleteButton}
                aria-label="Delete image"
              >
                <X size={24} />
              </button>
            </div>
          ) : (
            <label htmlFor="upload-photo" style={styles.uploadButton}>
              Tambahkan Foto
            </label>
          )}
          <input
            type="file"
            id="upload-photo"
            accept="image/*"
            onChange={handleFileChange}
            style={styles.fileInput}
          />
        </div>

        <button type="submit" style={styles.button}>
          Selesai
        </button>
      </form>
    </div>
  );
}

const styles = {
  formContainer: {
    backgroundColor: '#171D34',
    padding: '20px',
    margin: 'auto',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    color: '#ffffff',
    overflowY: 'auto', // Menambahkan scrollbar jika konten lebih panjang dari tinggi kontainer
  },
  
  inputContainer: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #3a3a50', // Warna border input yang lebih gelap
    backgroundColor: '#2a2a3d', // Warna background input yang gelap
    color: '#ffffff', // Warna teks input
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #3a3a50',
    backgroundColor: '#2a2a3d',
    color: '#ffffff',
    outline: 'none',
  },
  dayRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    width: '100%',
  },
  image: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '15px',
  },
  
  uploadButton: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#4e4e73', // Warna tombol unggah foto
    color: '#ffffff',
    marginBottom: '2%',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'center',
    width: '100%'
  },
  fileInput: {
    display: 'none', // Menyembunyikan input file default
  },
  button: {
    width: '100%',
    padding: '15px',
    borderRadius: '5px',
    backgroundColor: '#3366ff', // Warna biru untuk tombol submit
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginBottom: '2%'
  },
  buttonHover: {
    backgroundColor: '#254eda', // Warna lebih gelap saat tombol di-hover
  },
  imageContainer: {
    marginBottom: '15px',
    position: 'relative',
  },
  previewContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: '15px',
  },
  image: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '10px',
  },
  deleteButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ffffff',
    padding: '0',
    transition: 'background-color 0.3s ease',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#ffffff',
  },
  uploadButton: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#4e4e73',
    color: '#ffffff',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'center',
    width: '100%'
  },
  button: {
    width: '100%',
    padding: '15px',
    borderRadius: '5px',
    backgroundColor: '#3366ff',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginBottom: '2%'
  },
  buttonHover: {
    backgroundColor: '#254eda',
  },
  inputContainer: {
    marginBottom: '15px',
  },
  label: {
    color: '#e0e0e0',
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #3a3a50',
    backgroundColor: '#2a2a3d',
    color: '#ffffff',
    outline: 'none',
  },
};
export default ClaimLapak;
