import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate untuk navigasi

function LocationInfo({ locationData }) {
  const navigate = useNavigate(); // Hook untuk navigasi

  const handleNavigateToClaimLapak = () => {
    navigate("/claimlapak"); // Mengarahkan ke halaman /claimlapak
  };

  if (!locationData) {
    return <div></div>;
  }

  return (
    <div className="space-y-4 p-4">
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
          <p className="text-gray-400">Koordinat</p>
          <p className="text-white text-[14px] font-[400]">
            {locationData.coordinates || "Koordinat Tidak Tersedia"}
          </p>
        </div>

        <div className="border-t border-gray-600 pt-4">
          <p
            className="text-white text-[14px] font-[400] cursor-pointer hover:text-blue-400"
            onClick={handleNavigateToClaimLapak}
          >
            Apakah Anda Pemilik Lapak?
          </p>
        </div>
      </div>
    </div>
  );
}

function DraggableLocationInfo({ locationData, onClose }) {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const positionStart = useRef(0);

  // Set a maximum upward drag value (e.g., -200 pixels)
  const MAX_DRAG_UP = -100;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    positionStart.current = position;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientY - dragStartY.current;
    const newPosition = Math.min(0, positionStart.current + delta); // Limit to dragging up only
    setPosition(Math.max(newPosition, MAX_DRAG_UP)); // Prevent dragging beyond the maximum limit
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    dragStartY.current = e.touches[0].clientY;
    positionStart.current = position;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    const newPosition = Math.min(0, positionStart.current + delta);
    setPosition(Math.max(newPosition, MAX_DRAG_UP));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-[#222745] text-white p-4 rounded-[20px] cursor-grab"
      style={{
        transform: `translateY(${position}px)`,
        zIndex: 999,
        transition: isDragging ? "none" : "transform 0.3s ease-in-out",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        className="absolute right-4 text-white text-[18px] font-bold bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full shadow-md transition duration-200 ease-in-out"
        onClick={onClose}
      >
        &times;
      </button>

      <LocationInfo locationData={locationData} />
    </div>
  );
}

export default DraggableLocationInfo;
