import React, { useState } from "react";

function ReviewLapak() {
  const [rating, setRating] = useState(0);  // Untuk menyimpan rating yang dipilih
  const [hover, setHover] = useState(null); // Untuk efek hover di bintang
  const [comment, setComment] = useState(""); // Untuk menyimpan komentar

  const handleRating = (rate) => {
    setRating(rate);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const submitReview = () => {
    console.log("Rating:", rating);
    console.log("Comment:", comment);
    // Di sini bisa tambahkan logic untuk submit review ke backend atau simpan ke state
  };

  return (
    <div className="bg-[#171D34] p-4 rounded-lg text-white">
      <h2 className="text-xl font-bold mb-2">Ulasan Lapak</h2>

      {/* Bagian rating bintang */}
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <label key={index}>
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => handleRating(ratingValue)}
                className="hidden"
              />
              <Star
                size={24}
                fill={ratingValue <= (hover || rating) ? "yellow" : "white"}
                stroke={ratingValue <= (hover || rating) ? "yellow" : "white"}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(null)}
              />
            </label>
          );
        })}
      </div>

      {/* Bagian untuk menambahkan komentar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tambahkan Komentar"
          value={comment}
          onChange={handleCommentChange}
          className="w-full bg-[#4C516D] text-white placeholder-gray-400 py-2 px-4 rounded-lg focus:outline-none"
        />
      </div>

      <button
        onClick={submitReview}
        className="bg-blue-500 px-4 py-2 rounded-lg text-white font-bold"
      >
        Submit Ulasan
      </button>
    </div>
  );
}

export default ReviewLapak;
