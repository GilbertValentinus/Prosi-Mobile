import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Lock } from "lucide-react";

function LoginForm() {
  return (
    <div className="flex flex-col h-screen bg-[#161A32] text-white p-6">
      <div className="mb-4">
        <Link to="/" className="inline-block">
          <ArrowLeft className="w-6 h-6 hover:text-blue-500 transition-colors" />
        </Link>
      </div>

      <div className="flex-grow flex flex-col justify-center items-center mb-[20%] lg:mb-0">
        <div className="w-full max-w-[320px]">
          <h1 className="text-[18px] font-bold text-center mb-6">Login</h1>

          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className="w-full bg-[#222745] rounded-[10px] py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan email anda"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  className="w-full bg-[#222745] rounded-[10px] py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan kata sandi anda"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Link
              to="/"
              className="block w-full bg-[#7389F4] hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-[10px] transition duration-300 text-center"
            >
              Login
            </Link>
          </form>

          <p className="mt-8 text-center text-sm">
            Butuh akun?{" "}
            <Link to="/signup" className="font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;