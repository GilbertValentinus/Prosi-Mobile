import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function DetailLapak() {
  const [lapakData, setLapakData] = useState({
    idLapak: '',
    namaLapak: '',
    kategoriLapak: '',
    alamat: '',
    latitude: '',
    longitude: '',
    telepon: '',
    deskripsiLapak: '',
    situs: '',
    layanan: '',
    fotoLapak: '',
    tanggalPengajuan: '',
    jamBuka: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    const fetchLapakData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8080/api/lapak/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch lapak data');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setLapakData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch lapak data');
        }
      } catch (error) {
        console.error('Error fetching lapak data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchLapakData();
    }
  }, [id]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div style={styles.formContainer}>
      <div style={styles.header}>
        <h1 style={styles.title}>{lapakData.namaLapak}</h1>
        <p style={styles.subtitle}>
          Tanggal Pengajuan: {new Date(lapakData.tanggalPengajuan).toLocaleDateString('id-ID')}
        </p>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.imageSection}>
          {lapakData.fotoUrl && (
            <img 
              src={`http://localhost:8080/${lapakData.fotoUrl}`} 
              alt={lapakData.namaLapak} 
              style={styles.image} 
            />
          )}
        </div>

        <div style={styles.infoSection}>
          <InfoField label="Kategori" value={lapakData.kategoriLapak} />
          <InfoField label="Alamat" value={lapakData.alamat} />
          <InfoField 
            label="Koordinat Lokasi" 
            value={`${lapakData.latitude}, ${lapakData.longitude}`} 
          />
          <InfoField label="No. Telepon" value={lapakData.telepon} />
          <InfoField 
            label="Situs" 
            value={
              lapakData.situs ? (
                <a 
                  href={lapakData.situs} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={styles.link}
                >
                  {lapakData.situs}
                </a>
              ) : '-'
            } 
          />
          <InfoField label="Layanan" value={lapakData.layanan || '-'} />
        </div>

        <div style={styles.descriptionSection}>
          <h2 style={styles.sectionTitle}>Deskripsi Lapak</h2>
          <div style={styles.description}>
            {lapakData.deskripsiLapak || 'Tidak ada deskripsi'}
          </div>
        </div>

        <div style={styles.operationalSection}>
          <h2 style={styles.sectionTitle}>Jam Operasional</h2>
          <div style={styles.scheduleGrid}>
            {lapakData.jamBuka.map((schedule) => (
              <div key={schedule.hari} style={styles.scheduleItem}>
                <span style={styles.dayLabel}>{schedule.hari}</span>
                <span style={schedule.buka ? styles.openTime : styles.closedText}>
                  {schedule.buka ? `${schedule.jamBuka} - ${schedule.jamTutup}` : 'Tutup'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for displaying info fields
const InfoField = ({ label, value }) => (
  <div style={styles.infoField}>
    <span style={styles.label}>{label}</span>
    <div style={styles.value}>{value}</div>
  </div>
);

const styles = {
  formContainer: {
    backgroundColor: '#171D34',
    padding: '2rem',
    margin: '2rem auto',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    color: '#ffffff',
    maxWidth: '1000px',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: '0.875rem',
  },
  mainContent: {
    display: 'grid',
    gap: '2rem',
  },
  imageSection: {
    width: '100%',
    marginBottom: '2rem',
  },
  image: {
    width: '100%',
    height: 'auto',
    maxHeight: '500px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  infoSection: {
    display: 'grid',
    gap: '1rem',
  },
  infoField: {
    backgroundColor: '#1E293B',
    padding: '1rem',
    borderRadius: '8px',
  },
  label: {
    display: 'block',
    color: '#94A3B8',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  value: {
    color: '#ffffff',
    fontSize: '1rem',
  },
  descriptionSection: {
    marginTop: '2rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '1rem',
  },
  description: {
    backgroundColor: '#1E293B',
    padding: '1rem',
    borderRadius: '8px',
    lineHeight: '1.5',
  },
  operationalSection: {
    marginTop: '2rem',
  },
  scheduleGrid: {
    display: 'grid',
    gap: '0.5rem',
  },
  scheduleItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
  },
  dayLabel: {
    fontWeight: '500',
    color: '#94A3B8',
  },
  openTime: {
    color: '#4ADE80',
  },
  closedText: {
    color: '#FF5252',
  },
  link: {
    color: '#60A5FA',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
};

export default DetailLapak;