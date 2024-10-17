import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { lapakImages } from "../assets";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react"; // Assuming this import works for other parts

const { lapak1, lapak2, ig, profile } = lapakImages;

const LapakInfo = ({ lapak, onClose }) => {
  const panelRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Cek apakah perangkat adalah mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Perangkat mobile jika lebar layar <= 768px
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const redirectToReviewPage = () => {
    navigate("/reviewLapak"); // Make sure your route is properly set up
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      drag={isMobile ? false : "y"} // Nonaktifkan drag di mobile
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      className="fixed bottom-0 left-0 right-0 bg-[#222745] text-white p-4 rounded-t-[15px] shadow-lg no-scrollbar"
      style={{ zIndex: 1000, maxHeight: "80vh", overflowY: "auto" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{lapak.name}</h2>

        <button onClick={onClose} className="text-white">
          ×
        </button>
      </div>

      <div className="space-y-2">
        <p>{lapak.address}</p>
        <p>⭐️⭐️⭐️⭐️⭐️ 4.5 (25)</p>
        <p>
          <span className="text-red-600">Tutup</span> - Buka 14.00
        </p>
      </div>

      <div className="flex space-x-2 overflow-x-auto my-4">
        <img src={lapak1} className="w-full" />
        <img src={lapak2} className="w-full" />
        <img src={lapak1} className="w-full" />
      </div>

      <div>
        <p>📍 {lapak.address}</p>
      </div>
      <div className="border-[1px] border-[#AAAABC] my-4"></div>

      <div>
        <p>
          🕒 <span className="text-red-600"> Tutup</span> - Buka 14.00
        </p>
      </div>
      <div className="border-[1px] border-[#AAAABC] my-4"></div>

      <div className="flex space-x-2">
        <img src={ig} className="size-[22px]" />
        <p>htts://www.instagram.com/Teel/</p>
      </div>
      <div className="border-[1px] border-[#AAAABC] my-4"></div>

      {/* Comment Section */}
      <div className="rounded-lg text-white">
        <h2 className="text-xl font-bold mb-2">Ulasan</h2>
        <div className="flex items-start w-full gap-4 py-2">
          <img src={profile} className="w-7 h-7 rounded-full" alt="Profile" />
          <div className="w-full">
            <button
              onClick={redirectToReviewPage}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Tambahkan Ulasan
            </button>
          </div>
        </div>
      </div>

      <div className="border-[1px] border-[#AAAABC] my-4"></div>
      <h2 className="text-xl font-bold mb-2">Laporkan Lapak</h2>
      {/* Laporkan button moved below */}
      <div>
        <button
          onClick={() => navigate("/laporLapak")}
          className="text-white bg-red-800 py-1 px-4 rounded-lg"
        >
          Laporkan
        </button>
      </div>

      <div className="border-[1px] border-[#AAAABC] my-4"></div>
      <div className="mt-4">
        <div className="space-y-2">
          <div>
            <div className="flex gap-4">
              <img
                src={profile}
                className="w-7 h-7 rounded-full"
                alt="Profile"
              />
              <p className="font-semibold">Budi</p>
            </div>
            <p className="py-2">
              ⭐️⭐️⭐️⭐️⭐️ <span className="text-[12px]">2 tahun lalu</span>{" "}
            </p>
            <p>Tempatnya bagus, makanannya enak</p>
          </div>
          <div className="border-[1px] border-[#AAAABC] my-4"></div>
          <div>
            <div className="flex gap-4">
              <img
                src={profile}
                className="w-7 h-7 rounded-full"
                alt="Profile"
              />
              <p className="font-semibold">Natasha</p>
            </div>
            <p className="py-2">
              ⭐️⭐️⭐️⭐️⭐️ <span className="text-[12px]">2 tahun lalu</span>{" "}
            </p>
            <p>
              Tempatnya bagus, makanannya enak, harganya murah. Recommended!
            </p>
          </div>
          <div className="border-[1px] border-[#AAAABC] my-4"></div>
          <div>
            <div className="flex gap-4">
              <img
                src={profile}
                className="w-7 h-7 rounded-full"
                alt="Profile"
              />
              <p className="font-semibold">Sofia</p>
            </div>
            <p className="py-2">
              ⭐️⭐️⭐️⭐️⭐️ <span className="text-[12px]">2 tahun lalu</span>{" "}
            </p>
            <p>Tempatnya bagus, makanannya enak</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LapakInfo;
