import React from "react";
import { ReviewLapak } from '../components/index'; // Import your components

function Review() {
  return (
    <div className="flex-grow">
      <ReviewLapak /> {/* Assuming ReviewForm contains your review form logic */}
    </div>
  );
}

export default Review;