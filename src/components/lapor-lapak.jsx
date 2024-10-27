import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { lapakImages } from "../assets";

const { profile } = lapakImages;

const LaporLapakPage = () => {
  const navigate = useNavigate();
  const { id_lapak } = useParams();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { lapak } = location.state || {};
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null); // Store the actual file
  const [photoPreview, setPhotoPreview] = useState(null); // Store the preview URL
  const fileInputRef = useRef(null);

  useEffect(() => {
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
  }, [navigate]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file); // Store the actual file
      setPhotoPreview(URL.createObjectURL(file)); // Create preview URL
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  const resetPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photoFile) {
      alert("No file selected. Please upload a photo.");
      return;
    }

    const formData = new FormData();
    formData.append("alasan_lapak", description);
    formData.append("id_lapak", id_lapak);
    formData.append("foto", photoFile); // Use the stored file

    try {
      const response = await axios.post("http://localhost:8080/api/laporLapak", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
      });

      if (response.data.success) {
        alert("Laporan berhasil dikirim!");
        navigate(-1); // Go back to previous page
      }
    } catch (error) {
      console.error("Error submitting report:", error.response?.data || error.message);
      alert("Gagal mengirim laporan. Silakan coba lagi.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-[#222745] min-h-screen text-white p-6">
      <div className="flex items-center mb-6">
        <button className="text-white" onClick={() => window.history.back()}>
          ←
        </button>
        <h1 className="ml-4 text-xl font-semibold">Laporkan Lapak - {lapak?.name}</h1>
      </div>

      <div className="flex items-center mb-4">
        <img src={profile} alt="User" className="w-10 h-10 rounded-full" />
        <span className="ml-4 text-lg">{user?.username}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="text-lg mb-2">Deskripsi Laporan</h2>
          <textarea
            className="w-full bg-[#4C516D] text-white placeholder-gray-400 py-2 px-4 rounded-lg focus:outline-none"
            rows="4"
            placeholder="Masukkan deskripsi laporan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <h2 className="text-lg mb-2">Foto Bukti</h2>
          {photoPreview ? (
            <div className="relative w-full h-40">
              <img
                src={photoPreview}
                alt="Bukti laporan"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={resetPhoto}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="block w-full bg-[#4C516D] text-center py-2 rounded-lg cursor-pointer">
              <input
                type="file"
                name="foto"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              Tambahkan Foto
            </label>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-500 py-2 rounded-lg text-white"
          disabled={!photoFile || !description}
        >
          Kirim
        </button>
      </form>
    </div>
  );
};

export default LaporLapakPage;