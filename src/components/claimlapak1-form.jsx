import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ClaimForm1() {
  const [namaLapak, setNamaLapak] = useState('');
  const [kategoriLapak, setKategoriLapak] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Nama Lapak:', namaLapak);
    console.log('Kategori Lapak:', kategoriLapak);
    navigate('/claimlapak2');
  };

 

  return (
    <form onSubmit={handleSubmit} style={styles.formContainer}>
      <input
        type="text"
        placeholder="Nama lapak"
        value={namaLapak}
        onChange={(e) => setNamaLapak(e.target.value)}
        style={styles.input}
      />
      <select
        value={kategoriLapak}
        onChange={(e) => setKategoriLapak(e.target.value)}
        style={styles.select}
      >
        <option value="" disabled>
          Kategori Lapak
        </option>
        <option value="Kategori1">Kategori 1</option>
        <option value="Kategori2">Kategori 2</option>
        <option value="Kategori3">Kategori 3</option>
      </select>
      <button type="submit" style={styles.button}>
        Lanjutkan
      </button>
    </form>
  );
}

const styles = {
  formContainer: {
    backgroundColor: '#1A1B29',
    padding: '20px',
    borderRadius: '10px',
    width: '300px',
    margin: '0 auto',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#2C2D3E',
    color: '#FFFFFF',
  },
  select: {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#2C2D3E',
    color: '#FFFFFF',
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

export default ClaimForm1;
