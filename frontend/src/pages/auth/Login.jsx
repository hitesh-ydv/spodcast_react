import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setMessage("✅ Login successful! Redirecting...");
      setIsError(false);
      setLoading(false);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setLoading(false);
      setIsError(true);
      setMessage(
        err.response?.data?.msg ||
          "Login failed. Please check your email or password."
      );
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#121212] text-white">
      <form
        onSubmit={handleLogin}
        className="p-8 bg-[#1a1a1a] rounded-2xl w-96 space-y-5 shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center mb-4 text-[#1db954]">
          Welcome Back
        </h2>

        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-3 rounded bg-[#282828] text-white outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-[#282828] text-white outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1db954] text-black font-semibold py-3 rounded hover:opacity-90 transition"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        {message && (
          <p
            className={`text-center text-sm mt-2 ${
              isError ? "text-red-400" : "text-green-400"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-gray-400 text-sm mt-4">
          Don’t have an account?{" "}
          <span
            className="text-[#1db954] cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}
