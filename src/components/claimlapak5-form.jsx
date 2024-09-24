import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ClaimForm5() {
  const [deskripsiLapak, setDeskripsiLapak] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Deskripsi Lapak:', deskripsiLapak);
    navigate('/claimlapak6');
  };

  return (
    <form onSubmit={handleSubmit} style={styles.formContainer}>
      <input
        type="text"
        placeholder="Deskripsi lapak"
        value={deskripsiLapak}
        onChange={(e) => setDeskripsiLapak(e.target.value)}
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

export default ClaimForm5;
