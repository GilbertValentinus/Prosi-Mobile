import React, { useState, useEffect } from 'react';

function ClaimForm() {
  const [formData, setFormData] = useState({
    namaLapak: '',
    kategoriLapak: '',
    alamat: '',
    telepon: '',
    deskripsiLapak: '',
    selectedFile: null,
    jamBuka: {}
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ 
      ...prev, 
      selectedFile: file,
      previewUrl: URL.createObjectURL(file)
    }));
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

  useEffect(() => {
    const selectedLocation = JSON.parse(localStorage.getItem('selectedLocation'));
    if (selectedLocation?.address) {
      setFormData(prev => ({ ...prev, address: selectedLocation.address }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Dapatkan userId dari sesi login
      const userResponse = await fetch('http://localhost:8080/api/user', { credentials: 'include' });
      const userData = await userResponse.json();
      const userId = userData?.user?.id_pengguna;
  
      if (!userId) {
        throw new Error('User not logged in');
      }
  
      const formDataToSend = new FormData();
  
      // Tambahkan userId ke dalam formData
      formDataToSend.append('userId', userId);
  
      // Append basic form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'selectedFile' && key !== 'previewUrl' && key !== 'jamBuka') {
          formDataToSend.append(key, formData[key]);
        }
      });
  
      // Append operating hours
      formDataToSend.append('jamBuka', JSON.stringify(formData.jamBuka));
      
      // Append file if exists
      if (formData.selectedFile) {
        formDataToSend.append('foto', formData.selectedFile);
      }
  
      const response = await fetch('http://localhost:8080/api/claim-lapak', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include', // Sertakan cookie sesi
      });
  
      const data = await response.json();
  
      if (data.success) {
        alert('Data lapak berhasil disimpan!');
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
  
        {formData.previewUrl ? (
          <img src={formData.previewUrl} alt="Preview" style={styles.image} />
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
  
        <button type="submit" style={styles.button}>
          Selesai
        </button>
      </form>
    </div>
  );
  
}

const styles = {
    formContainer: {
      backgroundColor: '#1e1e2f', // Dark background
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
      width: '400px', // Adjust as needed
      margin: 'auto',
      color: '#ffffff' // White text
    },
    input: {
      backgroundColor: '#2a2a4d', // Dark input background
      border: '1px solid #4d4d6a', // Border color
      color: '#ffffff', // Text color
      borderRadius: '5px',
      padding: '10px',
      marginBottom: '15px',
      width: '100%', // Full width
    },
    select: {
      backgroundColor: '#2a2a4d',
      border: '1px solid #4d4d6a',
      color: '#ffffff',
      borderRadius: '5px',
      padding: '10px',
      marginBottom: '15px',
      width: '100%',
    },
    button: {
      backgroundColor: '#4d88ff', // Light blue button
      color: '#ffffff',
      padding: '10px 15px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '16px',
      width: '100%',
    },
    uploadButton: {
      backgroundColor: '#4d88ff', // Same as button
      color: '#ffffff',
      padding: '10px',
      borderRadius: '5px',
      display: 'inline-block',
      cursor: 'pointer',
      marginBottom: '15px',
      textAlign: 'center',
      width: '100%',
    },
    fileInput: {
      display: 'none', // Hide the default file input
    },
    image: {
      maxWidth: '100%', // Ensure the image fits within the container
      marginBottom: '15px',
    },
    dayRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '15px',
      color: '#ffffff', // Text color for the day labels
    }
  };
  

export default ClaimForm;