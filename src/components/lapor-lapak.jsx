import React from "react";
import { useNavigate } from "react-router-dom";

const LaporLapak = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold">Laporkan Lapak</h2>
      <div>
        {/* "Laporkan" button */}
        <button
          onClick={() => navigate("/laporLapak")}
          className="text-white bg-red-600 py-2 px-4 rounded-lg"
        >
          Laporkan
        </button>
        {/* Close button */}
        <button onClick={onClose} className="text-white ml-4">
          ×
        </button>
      </div>
    </div>
  );
};

export default LaporLapak;
