import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { lapakImages } from "../assets";

const { profile } = lapakImages;

const LaporUlasanPage = () => {
  const navigate = useNavigate();
  const { id_ulasan } = useParams(); // Changed to get id_ulasan
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { review } = location.state || {}; // Get the review data
  const [description, setDescription] = useState("");

  useEffect(() => {
    console.log("Location state:", location.state);
  console.log(id_ulasan);
  console.log(review); // Log the review object to inspect its contents
   
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/user", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate, review]); // Add review to the dependency array to ensure it's logged on changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle report submission logic here
    console.log("Submitting report:", description); // Debugging output
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-[#222745] min-h-screen text-white p-6">
      <div className="flex items-center mb-6">
        <button className="text-white" onClick={() => window.history.back()}>
          ←
        </button>
        <h1 className="ml-4 text-xl font-semibold">
          Laporkan Ulasan 
        </h1>
      </div>

      <div className="mb-4">
        <h2 className="text-lg mb-2">Deskripsi Ulasan - {review?.nama_pengguna || "Nama Tidak Ditemukan"}</h2>
        <p>- {review?.deskripsi || "Deskripsi tidak tersedia."}</p>
      </div>

      <div className="border-[1px] border-[#AAAABC] my-4"></div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="text-lg mb-2">Tambahkan Deskripsi Laporan</h2>
          <textarea
            className="w-full bg-[#4C516D] text-white placeholder-gray-400 py-2 px-4 rounded-lg focus:outline-none"
            rows="4"
            placeholder="Masukkan deskripsi laporan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 py-2 rounded-lg text-white"
        >
          Kirim
        </button>
      </form>
    </div>
  );
};

export default LaporUlasanPage;
