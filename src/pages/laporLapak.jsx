import React, { useState } from "react";
import axios from "axios"; // Import axios

const LaporLapakPage = () => {
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);

  const handlePhotoUpload = (e) => {
    setPhoto(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const formData = new FormData();
    formData.append("alasan_lapak", description); // Append description
    if (photo) {
      formData.append("foto", e.target.elements.photo.files[0]); // Append the photo file
    }

    try {
      const response = await axios.post("/api/laporLapak", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data); // Handle success response (e.g., show success message)
      // Optionally, you can reset the form or redirect the user
    } catch (error) {
      console.error("Error submitting report:", error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <div className="bg-[#222745] min-h-screen text-white p-6">
      <div className="flex items-center mb-6">
        <button className="text-white" onClick={() => window.history.back()}>
          ←
        </button>
        <h1 className="ml-4 text-xl font-semibold">Laporkan Lapak</h1>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4"> {/* Add onSubmit to the form */}
        <div>
          <h2 className="text-lg mb-2">Deskripsi Laporan</h2>
          <textarea
            className="w-full bg-[#4C516D] text-white placeholder-gray-400 py-2 px-4 rounded-lg focus:outline-none"
            rows="4"
            placeholder="Masukkan deskripsi laporan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Photo Upload Section */}
        <div>
          <h2 className="text-lg mb-2">Foto Bukti</h2>
          {photo ? (
            <div className="relative w-full h-40">
              <img
                src={photo}
                alt="Uploaded"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => setPhoto(null)}
                className="absolute top-0 right-0 text-white bg-red-500 p-1 rounded-full"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="block w-full bg-[#4C516D] text-center py-2 rounded-lg cursor-pointer">
              <input
                type="file"
                name="photo" // Add name attribute for file input
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              Tambahkan Foto
            </label>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" className="w-full bg-blue-500 py-2 rounded-lg text-white"> {/* Change to type="submit" */}
          Kirim
        </button>
      </form>
    </div>
  );
};

export default LaporLapakPage;
