import React from "react";

function LocationInfo({ locationData }) {
  if (!locationData) {
    return <div></div>;
  }

  return (
    <div className="space-y-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-white text-[20px] font-[400]">
          {locationData.name || "Nama Lokasi Tidak Tersedia"}
        </h3>
        <p className="text-gray-300 text-[14px] font-[400]">
          {locationData.fullAddress || "Alamat Tidak Tersedia"}
        </p>
      </div>

      <div className="space-y-2">
        <div className="border-t border-gray-600 pt-4">
          <p className="text-gray-400">Coordinates</p>
          <p className="text-white text-[14px] font-[400]">
            {locationData.coordinates || "Koordinat Tidak Tersedia"}
          </p>
        </div>

        {/* <div className="border-t border-gray-600 pt-4">
          <p className="text-gray-400">Plus Code</p>
          <p className='text-white text-[14px] font-[400]'>{locationData.plusCode}</p>
        </div> */}

        <div className="border-t border-gray-600 pt-4">
          <p className="text-white text-[14px] font-[400]">
            Apakah Anda Pemilik Lapak?
          </p>
        </div>
      </div>
    </div>
  );
}

export default LocationInfo;
