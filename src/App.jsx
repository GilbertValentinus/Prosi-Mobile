import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Favorit from "./pages/favorit";
import Lapak from "./pages/lapak";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login/> } />
        <Route path="/signup" element={<Signup /> } />
        <Route path="/favorit" element={<Favorit /> } />
        <Route path="/lapak" element={<Lapak /> } />


      </Routes>
    </Router>
  )
}

export default App
