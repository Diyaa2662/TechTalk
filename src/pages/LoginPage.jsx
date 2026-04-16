import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "/src/assets/logo.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login:", { email, password });
  };

  return (
    <div className="min-h-screen bg-darkShade flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo with Glass Effect */}
        <div className="relative flex justify-center">
          {/* Blur background behind logo */}
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-40 h-40 bg-yellowShade/20 rounded-full blur-2xl"></div>
          </div>
          <img
            src={logo}
            alt="TechTalk Logo"
            className="h-16 w-auto relative z-10"
          />
        </div>

        <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
          TechTalk
        </h2>
        <h3 className="mt-4 text-center text-2xl font-bold text-white">
          Welcome Back
        </h3>
        <p className="mt-2 text-center text-sm text-gray-400">
          Sign in to continue to TechTalk
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Glass Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                E-mail
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-yellowShade focus:border-yellowShade sm:text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-yellowShade focus:border-yellowShade sm:text-sm"
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-yellowShade hover:text-yellowShade/80"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-darkShade bg-yellowShade hover:bg-yellowShade/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellowShade"
              >
                Sign In
              </button>
            </div>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have account?{" "}
              <Link
                to="/signup"
                className="font-medium text-yellowShade hover:text-yellowShade/80"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
