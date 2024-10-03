import React from "react";
import { component } from "../index";
const { Map, Navbar, Searchbar, LocationInfo } = component;

function Home() {
  return (
    <div className="relative overflow-y-hidden">
      <Searchbar />
      <LocationInfo />
      <Map />
      <Navbar />
    </div>
  );
}

export default Home;
