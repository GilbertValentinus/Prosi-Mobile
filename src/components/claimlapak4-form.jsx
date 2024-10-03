import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ClaimForm4() {
  const [operatingHours, setOperatingHours] = useState({
    Senin: { buka: false, jamBuka: '', jamTutup: '' },
    Selasa: { buka: false, jamBuka: '', jamTutup: '' },
    Rabu: { buka: false, jamBuka: '', jamTutup: '' },
    Kamis: { buka: false, jamBuka: '', jamTutup: '' },
    Jumat: { buka: false, jamBuka: '', jamTutup: '' },
    Sabtu: { buka: false, jamBuka: '', jamTutup: '' },
    Minggu: { buka: false, jamBuka: '', jamTutup: '' },
  });

  const navigate = useNavigate();

  const handleTimeChange = (day, field, value) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleToggleOpen = (day) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], buka: !prev[day].buka, jamBuka: '', jamTutup: '' },
    }));
  };

  const handleNext = () => {
    console.log('Operating Hours:', operatingHours);
    navigate('/claimlapak5');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Klaim Lapak</h2>
      <p style={styles.subtitle}>Konfirmasikan jam buka lapak anda</p>

      <div style={styles.hoursContainer}>
        {Object.keys(operatingHours).map((day) => (
          <div key={day} style={styles.dayRow}>
            <div style={styles.dayLabel}>
              <span>{day}</span>
              <label style={styles.toggleContainer}>
                <input
                  type="checkbox"
                  checked={operatingHours[day].buka}
                  onChange={() => handleToggleOpen(day)}
                />
                <span style={styles.toggleLabel}>Buka</span>
              </label>
            </div>
            <div style={styles.timeFields}>
              <input
                type="time"
                placeholder="Jam Buka"
                value={operatingHours[day].jamBuka}
                onChange={(e) => handleTimeChange(day, 'jamBuka', e.target.value)}
                disabled={!operatingHours[day].buka}
                style={styles.input}
              />
              <span style={styles.separator}>-</span>
              <input
                type="time"
                placeholder="Jam Tutup"
                value={operatingHours[day].jamTutup}
                onChange={(e) => handleTimeChange(day, 'jamTutup', e.target.value)}
                disabled={!operatingHours[day].buka}
                style={styles.input}
              />
            </div>
          </div>
        ))}
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
  },
  title: {
    fontSize: '24px',
    textAlign: 'center',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  hoursContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  dayRow: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '10px',
  },
  dayLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  toggleLabel: {
    fontSize: '14px',
  },
  timeFields: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#2C2D3E',
    border: 'none',
    borderRadius: '5px',
    color: '#FFFFFF',
  },
  separator: {
    padding: '10px',
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
    marginTop: '20px',
  },
};

export default ClaimForm4;
