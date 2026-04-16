import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "/src/assets/logo.png";

const SignupPage = () => {
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Signup:", { fullName, userName, email, password });
  };

  return (
    <div className="min-h-screen bg-darkShade flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo with Glass Effect */}
        <div className="relative flex justify-center">
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
          Create Your Account
        </h3>
        <p className="mt-2 text-center text-sm text-gray-400">
          Join the TechTalk community today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Glass Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name and User Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-yellowShade focus:border-yellowShade sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="userName"
                  className="block text-sm font-medium text-gray-300"
                >
                  User Name
                </label>
                <div className="mt-1">
                  <input
                    id="userName"
                    name="userName"
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-yellowShade focus:border-yellowShade sm:text-sm"
                  />
                </div>
              </div>
            </div>

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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-yellowShade focus:border-yellowShade sm:text-sm"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-yellowShade focus:border-yellowShade sm:text-sm"
                />
              </div>
            </div>

            {/* Sign Up Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-darkShade bg-yellowShade hover:bg-yellowShade/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellowShade"
              >
                Sign up
              </button>
            </div>
          </form>

          {/* Sign In link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              You have account?{" "}
              <Link
                to="/login"
                className="font-medium text-yellowShade hover:text-yellowShade/80"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
