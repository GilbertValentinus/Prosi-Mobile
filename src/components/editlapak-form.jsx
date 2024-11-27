import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { X, ArrowLeft, Weight } from 'lucide-react';

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
    jamBuka: [],
    // foto: null,
    // isPhotoChanged: false,
    latitude: '',
    longitude: ''
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
            const { jamBuka, foto, ...rest } = data.data;
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
              foto: foto,
              previewUrl: foto ? foto : null
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        selectedFile: file,
        previewUrl: URL.createObjectURL(file),
        isPhotoChanged: true
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
      previewUrl: null,
      foto: null,
      isPhotoChanged: true
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
      
      // Append basic form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (!['selectedFile', 'previewUrl', 'jamBuka', 'isPhotoChanged', 'foto'].includes(key)) {
          formDataToSend.append(key, value);
        }
      });
  
      // Append user ID and lapak ID
      formDataToSend.append('userId', userId);
      formDataToSend.append('lapakId', id);
  
      // Handle photo upload
      if (formData.isPhotoChanged) {
        if (formData.selectedFile) {
          formDataToSend.append('foto', formData.selectedFile);
        } else {
          // If photo was removed, send a flag to delete it
          formDataToSend.append('deletePhoto', 'true');
        }
      }
  
      // Append formatted jamBuka data
      const jamBukaData = formData.jamBuka.map(({ hari, buka, jamBuka, jamTutup }) => ({
        hari,
        buka,
        jamBuka: buka ? jamBuka : '',
        jamTutup: buka ? jamTutup : ''
      }));
      
      formDataToSend.append('jamBuka', JSON.stringify(jamBukaData));
  
      const response = await fetch('http://localhost:8080/api/edit-lapak', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update lapak');
      }
  
      const data = await response.json();
  
      if (data.success) {
        alert('Data lapak berhasil diperbarui!');
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
      <Link to="/lapak" className="mr-4">
        <ArrowLeft className="w-6 h-6" />
      </Link>
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

        <div style={styles.inputContainer}>
          <label style={styles.label}>Foto Lapak</label>
          
          {/* Custom file input */}
          <label htmlFor="fileUpload" style={styles.customFileButton}>
            Choose File
          </label>
          <input
            id="fileUpload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }} // Hide the default file input
          />
          
          {formData.previewUrl && (
            <div style={styles.previewContainer}>
              <div style={styles.imageWrapper}>
                <img 
                  src={formData.previewUrl} 
                  alt="Preview" 
                  style={styles.previewImage} 
                />
                <button 
                  type="button" 
                  onClick={handleRemovePhoto} 
                  style={styles.removeButton}
                  aria-label="Remove photo"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        <button type="submit" style={styles.submitButton}>
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
};

const styles = {
  formContainer: {
    backgroundColor: '#171D34',
    padding: '20px',
    margin: '0 auto',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    color: '#ffffff',
    overflowY: 'auto',
    width: '100%', // Buat lebar form 100%
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#ffffff',
  },
  inputContainer: {
    marginBottom: '15px',
    width: '100%', // Pastikan semua elemen input memenuhi lebar form
  },
  previewContainer: {
    marginTop: '10px',
    position: 'relative',
    display: 'inline-block',
    width: '100%', // Menyesuaikan dengan lebar form
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 'auto',
  },
  previewImage: {
    width: '100%',
    borderRadius: '5px',
  },
  removeButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    // backgroundColor: '#ff4d4f',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#e0e0e0',
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  
  input: {
    width: '100%', // Sesuaikan lebar input dengan lebar kontainer
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #3a3a50',
    backgroundColor: '#2a2a3d',
    color: '#ffffff',
    outline: 'none',
  },
  timeInput: {
    color: '#ffffff', // Ubah warna teks menjadi hitam
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #3a3a50',
    backgroundColor: '#171D34', // Pastikan latar belakang berwarna putih agar teks hitam terlihat jelas
    outline: 'none',
    width: '100%', // Pastikan input time sesuai dengan lebar yang diinginkan
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
    resize: 'vertical',
  },
  section: {
    marginBottom: '15px',
    padding: '15px',
    border: '1px solid #3a3a50',
    borderRadius: '5px',
    backgroundColor: '#2a2a3d',
    width: '100%', // Sesuaikan lebar section dengan form
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    color: '#ffffff',
    fontSize: '1.1em',
    Weight: 'bolder',
  },
  customFileButton: {
    width: '100%', // Same width as the submit button
    padding: '10px',
    backgroundColor: '#4e4e73',
    color: '#ffffff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textAlign: 'center',
    display: 'inline-block',
  },
  dayRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    padding: '8px',
    backgroundColor: '#0F172A',
    borderRadius: '4px',
  },
  dayLabel: {
    flex: '1',
    fontWeight: 'bold',
  },
  timeControls: {
    display: 'flex',
    gap: '10px', // Tambahkan gap untuk jarak antar elemen waktu
    flex: '2',
  },
  checkbox: {
    marginRight: '10px',
  },
  submitButton: {
    width: '100%', // Buat tombol submit memenuhi lebar form
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: '#ffffff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};


export default EditLapak;
