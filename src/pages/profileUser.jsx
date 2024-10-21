import React from "react";
import { useNavigate } from "react-router-dom";

const ProfileUser = () => {
  const navigate = useNavigate();

  // Dummy data for user information
  const user = {
    username: "user123",
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
  };

  return (
    <div className="bg-[#222745] min-h-screen text-white p-6">
      {/* Header Section */}
      <div className="flex items-center mb-6">
        <button className="text-white" onClick={() => navigate("/")}>
          ←
        </button>
        <h1 className="ml-4 text-xl font-semibold">Profile User</h1>
      </div>

      {/* Profile Info Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Username</h2>
          <p className="bg-[#4C516D] p-2 rounded-lg">{user.username}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Full Name</h2>
          <p className="bg-[#4C516D] p-2 rounded-lg">{user.fullName}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Email</h2>
          <p className="bg-[#4C516D] p-2 rounded-lg">{user.email}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Phone Number</h2>
          <p className="bg-[#4C516D] p-2 rounded-lg">{user.phone}</p>
        </div>
      </div>

      {/* Back Button */}
      <button
        className="mt-6 w-full bg-blue-500 py-2 rounded-lg text-white"
        onClick={() => navigate("/")}
      >
        Back to Home
      </button>
    </div>
  );
};

export default ProfileUser;
