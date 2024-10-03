import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Handle form submission
  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          fullName,
          email,
          phone,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (data.success) {
          setMessage("Signup successful!");
          navigate("/login");
        } else {
          setMessage(data.message || "Signup failed.");
        }
      } else {
        const text = await response.text();
        console.error("Received non-JSON response:", text);
        setMessage("Received an unexpected response from the server. Please try again.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#161A32] text-white p-6 flex justify-center">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center mb-8">
          <Link to="/login" className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-[18px] font-bold text-center">
            Buat Akun Baru
          </h1>
        </div>

        <form className="space-y-4 mx-auto" onSubmit={handleSignup}>
          <div>
            <label htmlFor="fullName" className="block mb-1 text-[14px]">
              Nama Lengkap
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#222745] rounded-[10px] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="block mb-1 text-[14px]">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#222745] rounded-[10px] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 text-[14px]">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#222745] rounded-[10px] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-1 text-[14px]">
              Konfirmasi Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#222745] rounded-[10px] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 text-[14px]">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#222745] rounded-[10px] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block mb-1 text-[14px]">
              No. Telepon
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-300 bg-[#222745] rounded-l-[10px] border-r border-gray-600">
                +62
              </span>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-[#222745] rounded-r-[10px] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {message && (
            <p className="text-center text-sm text-red-500">{message}</p>
          )}

          <button
            type="submit"
            className="block w-full bg-[#7389F4] hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-[10px] transition duration-300 text-center"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
