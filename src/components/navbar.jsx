import React from "react";
import { Link } from "react-router-dom";
import { navbarImages } from "../assets"; 

const { telusuriIcon, lapakIcon, favoritIcon } = navbarImages;

function Navbar() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "#171D34",
        color: "#fff",
        zIndex: 999,
      }}
    >
      <div className="flex justify-evenly p-4 text-white">
        <Link
          to="/"
          className="flex flex-col items-center justify-center flex-1 text-center  font-[600] text-[11px]"
        >
          <img src={telusuriIcon} alt="Telusuri" className="h-5 mb-1" /> {/* Gambar */}
          Telusuri 
        </Link>
        <Link
          to="/favorit"
          className="flex flex-col items-center justify-center flex-1 text-center  font-[600] text-[11px]"
        >
          <img src={favoritIcon} alt="Favorit" className="h-5 mb-1" /> {/* Gambar */}
          Favorit 
        </Link>
        <Link
          to="/lapak"
          className="flex flex-col items-center justify-center flex-1 text-center font-[600] text-[11px]"
        >
          <img src={lapakIcon} alt="Lapak" className="h-5 mb-1" /> {/* Gambar */}
          Lapak 
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
