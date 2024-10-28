import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfileUser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // State to hold user data
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  // Assume the email is passed as a query parameter or retrieved from a session.
  const userEmail = "john.doe@example.com"; // Replace this with the actual user email

  useEffect(() => {
    // Fetch user data from API
    fetch(`/api/profile/${userEmail}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        } else {
          setError("User not found");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user profile:", err);
        setError("Error fetching profile");
        setLoading(false);
      });
  }, [userEmail]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-white">Error: {error}</div>;
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
      {user && (
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
      )}

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
