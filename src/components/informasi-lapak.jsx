import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { lapakImages } from "../assets";
import { Star } from "lucide-react";
import { useNavigate } from 'react-router-dom';


const { lapak1, lapak2, ig, profile } = lapakImages;

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span
        key={i}
        className={i < rating ? "text-yellow-500" : "text-gray-400"}
      >
        ★
      </span>
    );
  }
  return <div>{stars}</div>;
};

const LapakInfo = ({ lapak, onClose }) => {
  const panelRef = React.useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [statusLapak, setStatusLapak] = useState("");
  const navigate = useNavigate();

  const updateStatus = () => {
    if (lapak.jam_buka && lapak.jam_tutup) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [openHour, openMinute] = lapak.jam_buka.split(":").map(Number);
      const [closeHour, closeMinute] = lapak.jam_tutup.split(":").map(Number);
      const openTime = openHour * 60 + openMinute;
      const closeTime = closeHour * 60 + closeMinute;

      if (currentTime >= openTime && currentTime < closeTime) {
        setStatusLapak(`Buka - Tutup pada ${lapak.jam_tutup}`);
      } else {
        setStatusLapak(`Tutup - Buka pada ${lapak.jam_buka}`);
      }
    } else {
      setStatusLapak("Waktu buka dan tutup tidak tersedia");
    }
  };

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, [lapak]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // Menghilangkan duplikasi ulasan
  const uniqueReviews = Array.from(new Set(lapak.ulasan.map(review => review.id_ulasan)))
    .map(id => lapak.ulasan.find(review => review.id_ulasan === id));

  // Menghitung rata-rata rating dan total ulasan
  const totalUlasan = uniqueReviews.length;
  const totalRating = uniqueReviews.reduce((sum, review) => sum + review.rating, 0);
  const rataRating = totalUlasan > 0 ? (totalRating / totalUlasan).toFixed(1) : 0;

  const redirectToReviewPage = () => {
    navigate("/reviewLapak"); // Make sure your route is properly set up
  };


  return (
    <motion.div
      ref={panelRef}
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      drag={isMobile ? false : "y"}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      className="fixed bottom-0 left-0 right-0 bg-[#222745] text-white px-4 rounded-t-[15px] shadow-lg no-scrollbar"
      style={{ zIndex: 1000, maxHeight: "80vh", overflowY: "auto" }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 bg-[#222745] py-4 z-10 w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{lapak.name}</h2>
          <button onClick={onClose} className="text-white">
            ×
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p>{lapak.address}</p>
        <div className="flex items-center mb-2">
          <StarRating rating={Math.round(rataRating)} size="40px" />
          <p className="ml-2 text-[14px]">
            {rataRating} ({totalUlasan})
          </p>
        </div>
        <p>
          🕒{" "}
          {statusLapak.startsWith("Buka") ? (
            <>
              <span className="text-green-500">Buka</span> -{" "}
              {statusLapak.split(" - ")[1]}
            </>
          ) : (
            <>
              <span className="text-red-500">Tutup</span> -{" "}
              {statusLapak.split(" - ")[1]}
            </>
          )}
        </p>
      </div>

      {/* foto lapak */}
      <div className="flex space-x-2 overflow-x-auto my-4">
        {lapak.foto && (
          <img src={lapak.foto} className="w-full max-w-[250px]" alt="Lapak" />
        )}
      </div>

      <div>
        <p>📍 {lapak.address}</p>
      </div>
      <div className="border-[1px] border-[#AAAABC] my-4"></div>

      <div>
        <p>
          🕒{" "}
          {statusLapak.startsWith("Buka") ? (
            <>
              <span className="text-green-500">Buka</span> -{" "}
              {statusLapak.split(" - ")[1]}
            </>
          ) : (
            <>
              <span className="text-red-500">Tutup</span> -{" "}
              {statusLapak.split(" - ")[1]}
            </>
          )}
        </p>
      </div>
      <div className="border-[1px] border-[#AAAABC] my-4"></div>

      <div className="flex space-x-2">
        <img src={ig} className="size-[22px]" />
        <p className="truncate">{lapak.situs}</p>
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
        {/* tambahkan komentar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tambahkan Komentar"
            className="w-full bg-[#4C516D] text-white placeholder-gray-400 py-2 px-4 rounded-lg focus:outline-none"
          />
        </div>
      </div>
      <div className="border-[1px] border-[#AAAABC] my-4"></div>
      <div>
        <h2 className="text-xl font-bold mb-2">Ulasan</h2>
        {uniqueReviews.length > 0 ? (
          uniqueReviews.map((review) => (
            <div key={review.id_ulasan} className="my-4 space-y-1">
              <div className="flex gap-2">
                <img
                  src={profile}
                  className="w-7 h-7 rounded-full"
                  alt="Profile"
                />
                <p className="font-semibold">{review.nama_pengguna}</p>
              </div>
              <div className="flex gap-2">
                <StarRating rating={review.rating} />
                <p className="text-[12px] my-auto">
                  {new Date(review.tanggal).toLocaleDateString()}
                </p>
              </div>
              <p>{review.deskripsi}</p>
              {review.ulasan_foto && (
                <img
                  src={review.ulasan_foto}
                  alt="Ulasan Foto"
                  className="my-2"
                />
              )}
              <div className="border-[1px] border-[#AAAABC] my-4"></div>
            </div>
          ))
        ) : (
          <p>Tidak ada ulasan</p>
        )}
      </div>
      <div className="border-[1px] border-[#AAAABC] my-4"></div>
      <h2 className="text-xl font-bold mb-2">Laporkan Lapak</h2>
      {/* Laporkan button moved below */}
      < div >
        <button
          onClick={() => navigate("/laporLapak")}
          className="text-white bg-red-800 py-1 px-4 rounded-lg"
        >
          Laporkan
        </button>
      </div>
    </motion.div>
  );
};



export default LapakInfo;
