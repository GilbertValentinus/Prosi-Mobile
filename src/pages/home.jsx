import React from "react";
import { component } from "../index";
const { Map, Navbar, Searchbar } = component;

function Home() {
  return (
    <div className="relative">
      <Searchbar />
      <Map />
      <Navbar />
    </div>
  );
}

export default Home;
