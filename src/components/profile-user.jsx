import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfileUser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/user", {
          credentials: "include", // Send cookies with request
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user); // Set user data if successful
        } else {
          navigate("/login"); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login"); // Redirect to login on error
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while fetching
  }

  if (!user) {
    return <div>User not found</div>; // Optional fallback
  }

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
          <p className="bg-[#4C516D] p-2 rounded-lg">{user.username || "-"}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Full Name</h2>
          <p className="bg-[#4C516D] p-2 rounded-lg">{user.nama_lengkap || "-"}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Email</h2>
          <p className="bg-[#4C516D] p-2 rounded-lg">{user.email || "-"}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Phone Number</h2>
          <p className="bg-[#4C516D] p-2 rounded-lg">{user.nomor_telepon || "-"}</p>
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