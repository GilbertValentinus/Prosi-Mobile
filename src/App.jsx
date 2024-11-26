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
import KlaimLapak from "./pages/claimlapak";
import EditLapak from "./pages/editlapak";
import Favorit from "./pages/favorit";
import Lapak from "./pages/lapak";
import LapakDetail from "./pages/detaillapak";
import Bantuan  from "./pages/bantuan";
import Pilihsubject  from "./pages/pilihsubject";
import ForgotPasswordForm from "./pages/forgotPassword";
import ResetPasswordForm from "./pages/resetPassword";

//vincent
import Review from "./pages/reviewLapak";
import Lapor from "./pages/laporLapak";
import LaporUlas from "./pages/laporUlasan";
import Profile from "./pages/profileUser";
//vincent
import Navigation from "./pages/navigation";

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
        <Route path="/bantuan" element={<Bantuan /> } />
        <Route path="/Pilihsubject" element={<Pilihsubject /> } />
        <Route path="/claimlapak" element={<KlaimLapak /> } />
        <Route path="/editlapak/:id" element={<EditLapak />} />
        <Route path="/detaillapak/:id" element={<LapakDetail />} />
        <Route path="/editlapak" element={<EditLapak /> } />
        <Route path="/reviewLapak" element={<Review />} />
        <Route path="/reviewLapak/:id_lapak" element={<Review />} />
        <Route path="/laporLapak" element={<Lapor />} />
        <Route path="/laporLapak/:id_lapak" element={<Lapor />} />
        <Route path="/laporUlasan" element={<LaporUlas />} />
        <Route path="/laporUlasan/:id_ulasan" element={<LaporUlas />} />
        <Route path="/profileUser" element={<Profile />} />
        <Route path="/navigation" element={<Navigation /> } />
        <Route path="/forgot-password" element={<ForgotPasswordForm /> } />
        <Route path="/reset-password/:token" element={<ResetPasswordForm /> } />

      </Routes>
    </Router>
  )
}

export default App
