import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import KlaimLapak1 from "./pages/claimlapak1";
import KlaimLapak2 from "./pages/claimlapak2";
import KlaimLapak3 from "./pages/claimlapak3";
import KlaimLapak4 from "./pages/claimlapak4";
import KlaimLapak5 from "./pages/claimlapak5";
import KlaimLapak6 from "./pages/claimlapak6";
import Favorit from "./pages/favorit";
import Lapak from "./pages/lapak";
import Review from "./pages/reviewLapak";
import Lapor from "./pages/laporLapak";
import Profile from "./pages/profileUser";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login/> } />
        <Route path="/signup" element={<Signup /> } />
        <Route path="/claimlapak1" element={<KlaimLapak1 /> } />
        <Route path="/claimlapak2" element={<KlaimLapak2 /> } />
        <Route path="/claimlapak3" element={<KlaimLapak3 /> } />
        <Route path="/claimlapak4" element={<KlaimLapak4 /> } />
        <Route path="/claimlapak5" element={<KlaimLapak5 /> } />
        <Route path="/claimlapak6" element={<KlaimLapak6 /> } />
        <Route path="/favorit" element={<Favorit /> } />
        <Route path="/lapak" element={<Lapak /> } />
        <Route path="/reviewLapak" element={<Review /> } />
        <Route path="/laporLapak" element={<Lapor /> } />
        <Route path="/profileUser" element={<Profile /> } />
     </Routes>
    </Router>
  )
}

export default App
