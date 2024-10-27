import React from "react";
import { LaporUlasan } from '../components/index'; // Import your components

function laporUlas() {
  return (
    <div className="flex-grow">
      <LaporUlasan /> {/* Assuming ReviewForm contains your review form logic */}
    </div>
  );
}

export default laporUlas;