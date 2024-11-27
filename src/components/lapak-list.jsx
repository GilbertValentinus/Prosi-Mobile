import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function LapakList() {
  const [lapaks, setLapaks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLapakSummary = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/lapak-summary', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Lapak tidak ditemukan');
        }

        const data = await response.json();
        console.log('Fetched data:', data);

        if (data.success) {
          setLapaks(data.lapaks);
        } else {
          setError(data.message);
        }
      } catch (error) {
        console.error('Error fetching lapak summary:', error);
        setError('Lapak tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };

    fetchLapakSummary();
  }, []);

  const getStatusClassName = (status) => {
    switch (status) {
      case 'terverifikasi':
        return 'text-green-500';
      case 'terblokir':
        return 'text-red-500';
      case 'menunggu':
        return 'text-yellow-500';
      default:
        return 'text-gray-300';
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus lapak ini?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/lapak/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete lapak');
        }

        setLapaks((prevLapaks) => prevLapaks.filter((lapak) => lapak.id !== id));
        console.log(`Lapak dengan ID ${id} berhasil dihapus.`);
      } catch (error) {
        console.error('Error deleting lapak:', error);
        setError('Failed to delete lapak');
      }
    } else {
      console.log('Penghapusan lapak dibatalkan');
    }
  };

  const handleRequestUnblock = (id) => {
    console.log(`Mengajukan lepas blokir untuk lapak dengan ID ${id}`);
  };

  const handleDeleteAfterNavigate = (id) => {
    navigate(`/detaillapak/${id}`);
    setTimeout(() => {
      handleDelete(id);
    }, 300); // Tunda eksekusi penghapusan
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161A32] text-white p-6">
        <div className="flex items-center mb-8">
          <h1 className="text-[18px] font-semibold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#161A32] text-white p-6 flex items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161A32] text-white p-6">
      <div className="flex items-center mb-8">
        <Link to="/" className="mr-4">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[18px] font-semibold">Lapak</h1>
      </div>

      {lapaks.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Tidak ada lapak yang ditemukan
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {lapaks.map((lapak) => (
            <div
              key={lapak.id}
              className="border-b border-gray-700 pb-4 flex justify-between items-center"
            >
              <div>
                <Link to={`/detaillapak/${lapak.id}`}>
                  <h2 className="text-[15px] font-semibold mb-1">{lapak.name}</h2>
                  <p className="text-[13px] text-gray-400">{lapak.address}</p>
                  <p
                    className={`text-[13px] ${getStatusClassName(
                      lapak.status
                    )}`}
                  >
                    Status: {lapak.status}
                  </p>
                </Link>
              </div>
              <div className="flex space-x-4">
                {lapak.status === 'terverifikasi' ? (
                  <Link
                    to={`/editlapak/${lapak.id}`}
                    className="text-blue-500 hover:text-blue-400 text-sm"
                  >
                    Edit
                  </Link>
                ) : lapak.status === 'terblokir' ? (
                  <Link
                  to="/Pilihsubject"
                    className="text-yellow-500 hover:text-yellow-400 text-sm"
                    // onClick={() => handleRequestUnblock(lapak.id)}
                  >
                    Ajukan Lepas Blokir
                  </Link>
                ) : null}
                {/* {lapak.status !== 'terblokir' && (
                  <button
                    className="text-red-500 hover:text-red-400 text-sm"
                    onClick={() => handleDeleteAfterNavigate(lapak.id)}
                  >
                    Hapus
                  </button>
                )} */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LapakList;