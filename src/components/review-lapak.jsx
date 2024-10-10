import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function ReviewLapak() {
  const reviewList = [
    {
      name: 'Teman Lama',
      address: 'Jl. Bima No.60, Arjuna, Kec. Cicendo, Kota Bandung',
      status: 'Tutup',
      openTime: 'Buka 08.00'
    },
  ];

  return (
    <div className="min-h-screen bg-[#161A32] text-white p-6">
      <div className="flex items-center mb-8">
        <Link to="/" className="mr-4">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[18px] font-semibold">Lapak</h1>
      </div>
      
      <div className="space-y-4">
        {reviewList.map((reviewLapak, index) => (
          <div key={index} className="border-b border-gray-700 pb-4">
            <h2 className="text-[15px] font-semibold mb-1">{reviewLapak.name}</h2>
            <p className="text-[13px] text-gray-400 mb-1">{reviewLapak.address}</p>
            <p className="text-[13px]">
              <span className="text-red-500">{reviewLapak.status}</span>
              <span className="text-white"> - {reviewLapak.openTime}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewLapak;