import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditLapak = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    namaLapak: '',
    kategoriLapak: '',
    alamat: '',
    telepon: '',
    deskripsiLapak: '',
    situs: '',
    layanan: '',
    selectedFile: null,
    previewUrl: null,
    jamBuka: []
  });

  // Initialize jam buka state with all days
  useEffect(() => {
    const initializeJamBuka = () => {
      const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      const initialJamBuka = days.map(hari => ({
        hari,
        buka: false,
        jamBuka: '',
        jamTutup: ''
      }));
      setFormData(prev => ({ ...prev, jamBuka: initialJamBuka }));
    };
    initializeJamBuka();
  }, []);

  // Load location data from localStorage
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

  // Fetch existing lapak data
  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/api/lapak/${id}`, {
        credentials: 'include',
      })
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          if (data.success && data.data) {
            const { jamBuka, ...rest } = data.data;
            const formattedJamBuka = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(hari => {
              const dayData = jamBuka.find(j => j.hari === hari) || {
                buka: false,
                jamBuka: '',
                jamTutup: ''
              };
              return {
                hari,
                buka: dayData.buka,
                jamBuka: dayData.jamBuka || '',
                jamTutup: dayData.jamTutup || ''
              };
            });
            
            setFormData(prev => ({
              ...prev,
              ...rest,
              jamBuka: formattedJamBuka,
              previewUrl: data.data.foto ? data.data.foto : null // Set previewUrl from existing data
            }));
          }
        })
        .catch(error => console.error('Error fetching lapak data:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleToggleOpen = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      jamBuka: prev.jamBuka.map((day, index) => 
        index === dayIndex ? { ...day, buka: !day.buka } : day
      )
    }));
  };

  const handleTimeChange = (dayIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      jamBuka: prev.jamBuka.map((day, index) => 
        index === dayIndex ? { ...day, [field]: value } : day
      )
    }));
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      selectedFile: null,
      previewUrl: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userResponse = await fetch('http://localhost:8080/api/user', { 
        credentials: 'include' 
      });
      const userData = await userResponse.json();
      const userId = userData?.user?.id_pengguna;

      if (!userId) {
        throw new Error('User not logged in');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('userId', userId);
      formDataToSend.append('lapakId', id);

      // Append basic form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'selectedFile' && key !== 'previewUrl' && key !== 'jamBuka') {
          formDataToSend.append(key, value);
        }
      });

      // Append formatted jamBuka data
      const jamBukaData = formData.jamBuka.map(({ hari, buka, jamBuka, jamTutup }) => ({
        hari,
        buka,
        jamBuka: buka ? jamBuka : '',
        jamTutup: buka ? jamTutup : ''
      }));
      
      formDataToSend.append('jamBuka', JSON.stringify(jamBukaData));

      // Append file if selected
      if (formData.selectedFile) {
        formDataToSend.append('foto', formData.selectedFile);
      }

      const response = await fetch('http://localhost:8080/api/edit-lapak', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        alert('Data lapak berhasil diperbarui!');
        navigate('/');
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
      <h2 style={styles.title}>Edit Lapak</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.inputContainer}>
          <label style={styles.label}>Nama Lapak</label>
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

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Jam Operasional</h3>
          {formData.jamBuka.map((day, index) => (
            <div key={day.hari} style={styles.dayRow}>
              <label style={styles.dayLabel}>{day.hari}</label>
              <div style={styles.timeControls}>
                <input
                  type="checkbox"
                  checked={day.buka}
                  onChange={() => handleToggleOpen(index)}
                  style={styles.checkbox}
                />
                <input
                  type="time"
                  value={day.jamBuka}
                  onChange={(e) => handleTimeChange(index, 'jamBuka', e.target.value)}
                  disabled={!day.buka}
                  style={styles.timeInput}
                />
                <input
                  type="time"
                  value={day.jamTutup}
                  onChange={(e) => handleTimeChange(index, 'jamTutup', e.target.value)}
                  disabled={!day.buka}
                  style={styles.timeInput}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.label}>Deskripsi Lapak</label>
          <textarea
            name="deskripsiLapak"
            value={formData.deskripsiLapak}
            onChange={handleChange}
            style={styles.textarea}
            required
          />
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.label}>Situs Web</label>
          <input
            type="url"
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

        <div style={styles.inputContainer}>
          <label style={styles.label}>Foto Lapak</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={styles.fileInput}
          />
          {formData.previewUrl && (
            <div style={styles.previewContainer}>
              <img src={formData.previewUrl} alt="Preview" style={styles.previewImage} />
              <button type="button" onClick={handleRemovePhoto} style={styles.removeButton}>Hapus Foto</button>
            </div>
          )}
        </div>

        <button type="submit" style={styles.submitButton}>Simpan Perubahan</button>
      </form>
    </div>
  );
};

const styles = {
  formContainer: {
    backgroundColor: '#171D34',
    padding: '20px',
    margin: 'auto',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    color: '#ffffff',
    overflowY: 'auto', // Add scrollbar if content exceeds container height
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  inputContainer: {
    marginBottom: '15px',
  },
  label: {
    color: '#e0e0e0', // Lighter color for label text
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #3a3a50', // Darker border color
    backgroundColor: '#2a2a3d', // Dark background for input
    color: '#ffffff', // Input text color
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
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #3a3a50',
    backgroundColor: '#2a2a3d',
    color: '#ffffff',
    outline: 'none',
    height: '100px',
  },
  section: {
    marginBottom: '15px',
    padding: '10px',
    border: '1px solid #3a3a50',
    borderRadius: '5px',
    backgroundColor: '#2a2a3d',
  },
  sectionTitle: {
    margin: '0 0 10px 0',
    color: '#ffffff',
  },
  dayRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  dayLabel: {
    flex: '1',
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  timeControls: {
    flex: '2',
    display: 'flex',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: '10px',
  },
  timeInput: {
    marginRight: '10px',
    padding: '5px',
    borderRadius: '5px',
    border: '1px solid #3a3a50',
    backgroundColor: '#2a2a3d',
    color: '#ffffff',
    width: '80px',
  },
  previewContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '10px',
  },
  previewImage: {
    width: '80px',
    height: '80px',
    borderRadius: '5px',
    marginRight: '10px',
  },
  removeButton: {
    padding: '5px 10px',
    backgroundColor: '#ff4d4d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 15px',
    backgroundColor: '#3366ff', // Button color
    color: '#ffffff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.3s ease',
  },
  submitButtonHover: {
    backgroundColor: '#254eda', // Darker color on hover
  },
  fileInput: {
    display: 'block',
    marginTop: '10px',
  },
  section: {
    marginBottom: '15px',
    padding: '10px',
    border: '1px solid #3a3a50',
    borderRadius: '5px',
    backgroundColor: '#2a2a3d',
  },
  sectionTitle: {
    margin: '0 0 10px 0',
    color: '#ffffff',
  },
  dayRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    width: '100%', // Ensure it takes the full width
  },
  dayLabel: {
    flex: '1',
    fontWeight: 'bold',
    color: '#e0e0e0',
    textAlign: 'left', // Align text to the left
  },
  timeControls: {
    flex: '2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensure space is distributed evenly
  },
  checkbox: {
    marginRight: '10px',
  },
  timeInput: {
    marginRight: '10px',
    padding: '5px',
    borderRadius: '5px',
    border: '1px solid #3a3a50',
    backgroundColor: '#2a2a3d',
    color: '#ffffff',
    width: '80px',
  },
};

export default EditLapak;
