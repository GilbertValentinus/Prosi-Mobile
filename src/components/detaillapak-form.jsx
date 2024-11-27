import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
    jamBuka: [],
    status: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  const formatTime = (time) => {
    if (!time) return '';
    if (time.length === 5) return time;
    return time.substring(0, 5);
  };

  const getDayName = (day) => {
    const days = {
      1: 'Senin',
      2: 'Selasa',
      3: 'Rabu',
      4: 'Kamis',
      5: 'Jumat',
      6: 'Sabtu',
      7: 'Minggu'
    };
    return days[day] || day;
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus lapak ini?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/lapak/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Gagal menghapus lapak');
        }

        // Navigasi kembali setelah berhasil menghapus
        navigate(-1);
        console.log(`Lapak dengan ID ${id} berhasil dihapus.`);
      } catch (error) {
        console.error('Error menghapus lapak:', error);
        setError('Gagal menghapus lapak');
      }
    } else {
      console.log('Penghapusan lapak dibatalkan');
    }
  };

  useEffect(() => {
    const fetchLapakData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8080/api/lapak/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data lapak');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          const formattedJamBuka = result.data.jamBuka.map(jam => ({
            hari: getDayName(jam.hari),
            jamBuka: formatTime(jam.jamBuka),
            jamTutup: formatTime(jam.jamTutup),
            buka: jam.buka
          }));

          formattedJamBuka.sort((a, b) => {
            const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
            return dayOrder.indexOf(a.hari) - dayOrder.indexOf(b.hari);
          });

          setLapakData({
            ...result.data,
            jamBuka: formattedJamBuka
          });
        } else {
          throw new Error(result.message || 'Gagal mengambil data lapak');
        }
      } catch (error) {
        console.error('Error mengambil data lapak:', error);
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
    return <div className="loading">Memuat...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div style={styles.formContainer}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        <ArrowLeft style={styles.arrowIcon} />
      </button>

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
            src={lapakData.fotoUrl}
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
            {Array.isArray(lapakData.jamBuka) && lapakData.jamBuka.length > 0 ? (
              lapakData.jamBuka.map((schedule, index) => (
                <div key={index} style={styles.scheduleItem}>
                  <span style={styles.dayLabel}>{schedule.hari}</span>
                  <div style={styles.timeContainer}>
                    {schedule.buka ? (
                      <span style={styles.openTime}>
                        {schedule.jamBuka} - {schedule.jamTutup}
                      </span>
                    ) : (
                      <span style={styles.closedText}>Buka</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.scheduleItem}>
                <span style={styles.noSchedule}>Jadwal tidak tersedia</span>
              </div>
            )}
          </div>
            <button
              style={styles.deleteButton}
              onClick={handleDelete}
            >
              Hapus
            </button>
        </div>
      </div>
    </div>
  );
}

const InfoField = ({ label, value }) => (
  <div style={styles.infoField}>
    <span style={styles.label}>{label}</span>
    <div style={styles.value}>{value}</div>
  </div>
);

const styles = {
  formContainer: {
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#171D34',
    color: '#F1F5F9',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
    width: '100%',
    position: 'relative',
  },
  header: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#E2E8F0',
    position: 'absolute',
    left: '10px',
    top: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
  arrowIcon: {
    fontSize: '24px',
    color: '#E2E8F0',
    marginRight: '5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#94A3B8',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  imageSection: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  image: {
    width: '100%',
    maxWidth: '300px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  infoSection: {
    width: '100%',
    // display: 'grid',
    // gap: '10px',
    // padding: '10px 0',
  },
  descriptionSection: {
    padding: '10px 0',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: '10px',
  },
  description: {
    fontSize: '14px',
    color: '#CBD5E1',
    lineHeight: '1.5',
  },
  operationalSection: {
    padding: '10px 0',
  },
  scheduleGrid: {
    display: 'grid',
    gap: '8px',
    backgroundColor: '#0F172A',
    padding: '15px',
    borderRadius: '8px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#E2E8F0',
    position: 'absolute',
    left: '10px',
    top: '10px',
  },
  arrowIcon: {
    fontSize: '24px',
    color: '#E2E8F0',
  },
  scheduleItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: '1px solid #334155',
    backgroundColor: '#171D34',
    borderRadius: '6px',
  },
  dayLabel: {
    fontWeight: '500',
    color: '#ffffff',
    minWidth: '100px',
  },
  timeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  openTime: {
    color: '#4ADE80',
    fontSize: '14px',
    backgroundColor: '#008000',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  closedText: {
    color: '#FFFFFF',
    fontSize: '14px',
    backgroundColor: '#008000',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  noSchedule: {
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    width: '100%',
  },
  infoField: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #334155',
  },
  label: {
    fontWeight: 'bold',
    color: '#CBD5E1',
    minWidth: '150px',
  },
  value: {
    color: '#E2E8F0',
  },
  link: {
    color: '#38BDF8',
    textDecoration: 'none',
  },
  deleteButton: {
    marginTop: '10px',
    backgroundColor: '#DC2626',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  }
};

export default DetailLapak;