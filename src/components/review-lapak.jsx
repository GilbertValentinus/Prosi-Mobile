import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { lapakImages } from "../assets";

const { profile } = lapakImages;

const ReviewLapak = () => {
  const navigate = useNavigate();
  const { id_lapak } = useParams();
  const location = useLocation();
  const { lapak } = location.state || {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
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

  const handleRatingClick = (index) => {
    setRating(index + 1);
  };

  const handleReviewChange = (e) => {
    setReviewText(e.target.value);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  const resetPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Validasi input
    if (!user) {
      alert("User tidak ditemukan.");
      return;
    }

    if (!id_lapak) {
      alert("ID Lapak tidak ditemukan.");
      return;
    }

    if (rating < 1 || rating > 5) {
      alert("Rating harus antara 1 sampai 5.");
      return;
    }

    if (!reviewText.trim()) {
      alert("Silakan tulis review Anda.");
      return;
    }

    // Buat FormData object
    const formData = new FormData();
    formData.append("id_lapak", id_lapak);
    formData.append("id_pengguna", user.id_pengguna);
    formData.append("rating", rating);
    formData.append("deskripsi", reviewText);

    // Tambahkan foto hanya jika ada
    if (photoFile) {
      formData.append("foto", photoFile);
    }

    try {
      const response = await fetch("http://localhost:8080/api/review", {
        method: "POST",
        credentials: "include",
        body: formData, // Kirim sebagai FormData
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (result.success) {
        alert("Review berhasil dikirim!");
        navigate(-1);
      } else {
        alert(result.message || "Gagal mengirim review.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat mengirim review.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="review-page-container bg-[#0A0D1A] text-white min-h-screen p-4 flex flex-col justify-between">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-white">
          ←
        </button>
        <h1 className="ml-4 text-xl font-semibold">{lapak?.name}</h1>
      </div>

      <div className="flex items-center mb-4">
        <img src={profile} alt="User" className="w-10 h-10 rounded-full" />
        <span className="ml-4 text-lg">{user?.username}</span>
      </div>

      <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={index < rating ? "yellow" : "none"}
              stroke="white"
              width="32"
              height="32"
              onClick={() => handleRatingClick(index)}
              className="cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 17.27l5.18 3.73-1.64-6.36L21 9.24l-6.47-.56L12 3l-2.53 5.68L3 9.24l5.46 5.4-1.64 6.36L12 17.27z"
              />
            </svg>
          ))}
        </div>

        <textarea
          className="w-full h-40 p-4 bg-[#1C1E32] text-white rounded-lg focus:outline-none mb-6"
          placeholder="Tulis ulasan anda..."
          value={reviewText}
          onChange={handleReviewChange}
          required
        />

        <div>
          {photoPreview ? (
            <div className="relative w-full h-40">
              <img
                src={photoPreview}
                alt="Preview review"
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
              Tambahkan Foto Review
            </label>
          )}
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-lg text-lg ${
            rating === 0 ? "bg-gray-500" : "bg-blue-500 text-white"
          }`}
          disabled={rating === 0 || (!photoFile && !reviewText.trim())}
        >
          Kirim Ulasan
        </button>
      </form>
    </div>
  );
};

export default ReviewLapak;