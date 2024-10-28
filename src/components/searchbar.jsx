import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchbarImages, lapakImages } from "../assets";

const { profile } = lapakImages; // Ambil ikon profile
const { hamburgerIcon } = searchbarImages;

function Searchbar({ onSelectLocation }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/user", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, [navigate]);
  

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

  const handleSelectResult = (result) => {
    if (result.latitude && result.longitude) {
      onSelectLocation(parseFloat(result.latitude), parseFloat(result.longitude), result);
    }
    setSearchQuery(result.nama_lapak);
    setSearchResults([]);
  };

  const goToProfile = () => {
    navigate("/profileUser");
  };

  // Logout function
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/logout", {
        method: "POST",
        credentials: "include", // Include cookies
      });
      const data = await response.json();
      if (data.success) {
        setUser(null); // Clear user state on successful logout
        navigate("/"); // Redirect to login page
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-[1001]">
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

      {searchResults.length > 0 && (
        <div className="absolute w-full bg-[#222745] mt-1 rounded-b-[8px] max-h-[300px] overflow-y-auto">
          {searchResults.map((result) => (
            <div
              key={result.id_lapak}
              className="p-2 hover:bg-[#2c3252] cursor-pointer"
              onClick={() => handleSelectResult(result)}
            >
              <h3 className="text-white font-semibold">{result.nama_lapak}</h3>
              <p className="text-gray-300 text-sm">{result.lokasi_lapak}</p>
            </div>
          ))}
        </div>
      )}

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-50"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full bg-[#161A32] w-[55%] z-50 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col items-center space-y-6 px-8 py-12">
          <img src={profile} className="w-10 h-10 rounded-full" alt="Profile" onClick={goToProfile} />
          {user && (
            <p className="text-white text-xl font-semibold  rounded-lg mt-2 text-center">{user.username}</p>
          )}

          {user ? (
            <Link
              className="w-[150px] h-[30px] bg-white text-black text-[16px] font-[600] px-4 rounded-[40px] text-center border-white border-[1px]"
              onClick={handleLogout}
            >
              Logout
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-[150px] h-[30px] bg-white text-black text-[16px] font-[600] px-4 rounded-[40px] text-center border-white border-[1px]"
              onClick={toggleSidebar}
            >
              Login
            </Link>
          )}

          <Link
            to="/Pilihsubject"
            className="w-[150px] h-[30px] text-white text-[16px] font-[600] px-4 rounded-[40px] text-center border-white border-[1px]"
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



