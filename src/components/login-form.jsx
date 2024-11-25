import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

function LoginForm() {
  const [identifier, setIdentifier] = useState(''); // Store email or username
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Login berhasil!');
        navigate('/');
      } else {
        setMessage(data.message || 'Email/username atau password salah');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#161A32] text-white p-6">
      {/* Back Button */}
      <div className="mb-4">
        <Link to="/" className="inline-block">
          <ArrowLeft className="w-6 h-6 hover:text-blue-500 transition-colors" />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col justify-center items-center mb-[20%] lg:mb-0">
        <div className="w-full max-w-[320px]">
          <h1 className="text-[18px] font-bold text-center mb-6">Login</h1>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email/Username Field */}
            <div className="space-y-2">
              <label htmlFor="identifier" className="block text-sm">
                Email atau Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#222745] rounded-[10px] py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan email atau username anda"
                  required
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#222745] rounded-[10px] py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan kata sandi anda"
                  required
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Lupa password?
              </Link>
            </div>

            {/* Error/Success Message */}
            {message && (
              <p
                className={`text-center text-sm ${
                  message.includes('berhasil') ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {message}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="block w-full bg-[#7389F4] hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-[10px] transition duration-300 text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm">
            Butuh akun?{' '}
            <Link to="/signup" className="font-bold hover:underline text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;