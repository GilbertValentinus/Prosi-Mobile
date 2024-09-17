import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function SignupForm() {
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

        <form className="space-y-4 mx-auto">
          <div>
            <label htmlFor="username" className="block mb-1 text-[14px]">
              Nama Pengguna
            </label>
            <input
              type="text"
              id="username"
              className="w-full bg-[#222745] rounded-[10px] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 text-[14px]">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full bg-[#222745] rounded-[10px] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-1 text-[14px]">
              Konfirmasi Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full bg-[#222745] rounded-[10px] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 text-[14px]">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full bg-[#222745] rounded-[10px] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="flex-1 bg-[#222745] rounded-r-[10px] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Link
            to="/"
            className="block w-full bg-[#7389F4] hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-[10px] transition duration-300 text-center"
          >
            Sign Up
          </Link>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
