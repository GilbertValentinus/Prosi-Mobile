import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const FavoriteList = ({ lapak }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateStatus = (lapak) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMinute] = (lapak.jam_buka || '08:00').split(':').map(Number);
    const [closeHour, closeMinute] = (lapak.jam_tutup || '17:00').split(':').map(Number);
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;

    if (currentTime >= openTime && currentTime < closeTime) {
      return `Buka - Tutup pada ${lapak.jam_tutup}`;
    } else {
      return `Tutup - Buka pada ${lapak.jam_buka}`;
    }
  };

  useEffect(() => {
    const fetchUserAndFavorites = async () => {
      try {
        const userResponse = await axios.get('/api/user');
        if (!userResponse.data.success) {
          setError('User tidak ditemukan atau belum login');
          setLoading(false);
          return;
        }
        
        const userId = userResponse.data.user.id_pengguna;
        const favoritesResponse = await axios.get(`/api/lapak/favorite/${userId}`);
        
        if (favoritesResponse.data.success) {
          const uniqueLapaks = favoritesResponse.data.lapaks.reduce((acc, current) => {
            const x = acc.find(item => item.id_lapak === current.id_lapak);
            return x ? acc : acc.concat([current]);
          }, []);

          const processedFavorites = uniqueLapaks.map(lapak => ({
            ...lapak,
            status: updateStatus(lapak),
          }));
          
          setFavorites(processedFavorites);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Silahkan Login Terlebih dahulu');
        setLoading(false);
      }
    };

    fetchUserAndFavorites();

    const intervalId = setInterval(() => {
      setFavorites(prevFavorites => 
        prevFavorites.map(fav => ({ ...fav, status: updateStatus(fav) }))
      );
    }, 60000); // Update status setiap 1 menit

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161A32] text-white p-6 flex items-center justify-center">
        <div className="text-center">Memuat...</div>
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
        <h1 className="text-[18px] font-semibold">Favorit</h1>
      </div>
      
      <div className="space-y-4">
        {favorites.length === 0 ? (
          <div className="text-center text-gray-400">
            Belum ada lapak favorit
          </div>
        ) : (
          favorites.map((favorite) => (
            <div key={`${favorite.id_lapak}-${favorite.nama_lapak}`} className="border-b border-gray-700 pb-4">
              <h2 className="text-[15px] font-semibold mb-1">
                {favorite.nama_lapak}
              </h2>
              <p className="text-[13px] text-gray-400 mb-1">
                {favorite.lokasi_lapak}
              </p>
              <p className="text-[13px]">
                <span className={`${favorite.status.startsWith('Tutup') ? 'text-red-500' : 'text-green-500'}`}>
                  {favorite.status.startsWith('Buka') ? 'Buka' : 'Tutup'}
                </span>
                <span className="text-white"> - {favorite.status.split(' - ')[1]}</span>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FavoriteList;
