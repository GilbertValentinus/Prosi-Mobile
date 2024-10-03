import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function FavoriteList() {
  const favorites = [
    {
      name: 'Teman Lama',
      address: 'Jl. Bima No.60, Arjuna, Kec. Cicendo, Kota Bandung',
      status: 'Tutup',
      openTime: 'Buka 08.00'
    },
    {
      name: 'Teman Lama Cicendo',
      address: 'Jl. Cendana No.10, Cihapit, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40114',
      status: 'Tutup',
      openTime: 'Buka 11.00'
    }
  ];

  return (
    <div className="min-h-screen bg-[#161A32] text-white p-6">
      <div className="flex items-center mb-8">
        <Link to="/" className="mr-4">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[18px] font-semibold">Favorit</h1>
      </div>
      
      <div className="space-y-4">
        {favorites.map((favorite, index) => (
          <div key={index} className="border-b border-gray-700 pb-4">
            <h2 className="text-[15px] font-semibold mb-1">{favorite.name}</h2>
            <p className="text-[13px] text-gray-400 mb-1">{favorite.address}</p>
            <p className="text-[13px]">
              <span className="text-red-500">{favorite.status}</span>
              <span className="text-white"> - {favorite.openTime}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteList;