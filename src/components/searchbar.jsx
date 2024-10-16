import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchbarImages } from "../assets";

const { hamburgerIcon } = searchbarImages;

function Searchbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        fetchSearchResults();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchSearchResults = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/search?query=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.results);
      } else {
        console.error('Search failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  return (
    <div className="relative" style={{ zIndex: 1000 }}>
      {/* Searchbar */}
      <div className="flex bg-[#171D34] h-[50px] justify-between gap-8 px-4">
        <img
          src={hamburgerIcon}
          className="size-[20px] my-auto cursor-pointer"
          alt="Hamburger Icon"
          onClick={toggleSidebar}
        />
        <input
          type="text"
          className="bg-[#222745] text-white flex-1 px-4 py-2 rounded-[8px] w-full h-[35px] my-auto"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for places..."
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="absolute w-full bg-[#222745] mt-1 rounded-b-[8px] max-h-[300px] overflow-y-auto">
          {searchResults.map((result) => (
            <div key={result.id_lapak} className="p-2 hover:bg-[#2c3252] cursor-pointer">
              <h3 className="text-white font-semibold">{result.nama_lapak}</h3>
              <p className="text-gray-300 text-sm">{result.lokasi_lapak}</p>
            </div>
          ))}
        </div>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-50"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-[#161A32] w-[55%] z-50 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col space-y-6 px-8 py-12">
          <Link
            to="/login"
            className="max-w-[150px] h-[30px] bg-white text-black text-[16px] font-[600] px-4 rounded-[40px] text-center border-white border-[1px]"
            onClick={toggleSidebar}
          >
            Login
          </Link>

          <Link
            to="/bantuan"
            className="max-w-[150px] h-[30px] text-white text-[16px] font-[600] px-4 rounded-[40px] text-center border-white border-[1px]"
            onClick={toggleSidebar}
          >
            Bantuan
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Searchbar;