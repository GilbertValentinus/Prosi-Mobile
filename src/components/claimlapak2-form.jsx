import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ClaimForm2() {
  const [alamat, setAlamat] = useState('');
  const [kota, setKota] = useState('');
  const [provinsi, setProvinsi] = useState('');
  const [kodePos, setKodePos] = useState('');
  const [telepon, setTelepon] = useState('');
  const [teleponAlternatif, setTeleponAlternatif] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Alamat:', alamat);
    console.log('Kota:', kota);
    console.log('Provinsi:', provinsi);
    console.log('Kode Pos:', kodePos);
    console.log('Telepon:', telepon);
    console.log('Telepon Alternatif:', teleponAlternatif);
    navigate('/claimlapak3');
  };

  return (
    <form onSubmit={handleSubmit} style={styles.formContainer}>
      <input
        type="text"
        placeholder="Alamat"
        value={alamat}
        onChange={(e) => setAlamat(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Kota"
        value={kota}
        onChange={(e) => setKota(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Provinsi"
        value={provinsi}
        onChange={(e) => setProvinsi(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Kode Pos"
        value={kodePos}
        onChange={(e) => setKodePos(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="No. Telepon"
        value={telepon}
        onChange={(e) => setTelepon(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="No. Telepon Alternatif"
        value={teleponAlternatif}
        onChange={(e) => setTeleponAlternatif(e.target.value)}
        style={styles.input}
      />
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

export default ClaimForm2;
