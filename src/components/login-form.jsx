import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState(''); // To store email input
  const [password, setPassword] = useState(''); // To store password input
  const [message, setMessage] = useState(''); // To display login status messages
  const navigate = useNavigate(); // To navigate on successful login

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
      // Use relative path to make use of Vite's proxy
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
           credentials: 'include',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send email and password as JSON
      });

      const data = await response.json(); // Parse the response

      if (data.success) {
        setMessage('Login successful!');
        navigate('/'); // Redirect to home or other page after login
      } else {
        setMessage('Invalid email or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

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

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email} // Bind the email state
                  onChange={(e) => setEmail(e.target.value)} // Update email state on input change
                  className="w-full bg-[#222745] rounded-[10px] py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan email anda"
                  required // Make it a required field
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
                  value={password} // Bind the password state
                  onChange={(e) => setPassword(e.target.value)} // Update password state on input change
                  className="w-full bg-[#222745] rounded-[10px] py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan kata sandi anda"
                  required // Make it a required field
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Show the message, if any */}
            {message && (
              <p className="text-center text-sm text-red-500">{message}</p>
            )}

            <button
              type="submit"
              className="block w-full bg-[#7389F4] hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-[10px] transition duration-300 text-center"
            >
              Login
            </button>
          </form>

          <p className="mt-8 text-center text-sm">
            Butuh akun?{' '}
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
