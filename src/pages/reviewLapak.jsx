import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { lapakImages } from "../assets";

const { profile } = lapakImages;

function ReviewLapak() {
  const navigate = useNavigate();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const handleRatingClick = (index) => {
    setRating(index + 1); // Sets the rating based on the clicked star
  };

  const handleReviewChange = (e) => {
    setReviewText(e.target.value); // Updates review text
  };

  return (
    <div className="review-page-container bg-[#0A0D1A] text-white min-h-screen p-4 flex flex-col justify-between">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-white">
          ←
        </button>
        <h1 className="ml-4 text-xl font-semibold">Teman Lama</h1>
      </div>

      {/* Profile section */}
      <div className="flex items-center mb-4">
        <img
          src={profile} // Profile image
          alt="User"
          className="w-10 h-10 rounded-full"
        />
        <span className="ml-4 text-lg">User</span>
      </div>

      {/* Star rating */}
      <div className="flex justify-center gap-2 mb-4">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={index < rating ? "yellow" : "none"}
            stroke="white"
            width="32" // Increased size for better visibility
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

      {/* Review input */}
      <textarea
        className="w-full h-40 p-4 bg-[#1C1E32] text-white rounded-lg focus:outline-none mb-6"
        placeholder="Tulis ulasan anda..."
        value={reviewText}
        onChange={handleReviewChange}
      />

      {/* Submit button */}
      <button
        onClick={() => console.log({ rating, reviewText })}
        className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg"
      >
        Kirim Ulasan
      </button>
    </div>
  );
}

export default ReviewLapak;
