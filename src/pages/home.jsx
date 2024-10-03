import React from "react";
// import { Map, Navbar, Searchbar, LocationInfo } from '../index';
import { Map, Navbar, Searchbar, LocationInfo } from '../components/index';


function Home() {
  return (
    <div className="relative">
      <Searchbar />
      <LocationInfo />
      <Map />
      <Navbar/>
    </div>
  );
}

export default Home;

