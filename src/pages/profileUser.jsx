import React from "react";
import { ProfileUser } from '../components/index'; // Import your components

function Profile() {
  return (
    <div className="flex-grow">
      <ProfileUser /> {/* Assuming ReviewForm contains your review form logic */}
    </div>
  );
}

export default Profile;