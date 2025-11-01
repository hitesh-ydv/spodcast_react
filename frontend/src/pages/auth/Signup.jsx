import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const URL = import.meta.env.VITE_API_URL2;

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const res = await axios.post(`${URL}/api/auth/signup`, {
        name,
        email,
        password,
      });

      setMessage("✅ Verification email sent! Please check your inbox.");
      setIsError(false);
      setLoading(false);

      setTimeout(() => navigate("/login"), 4000);
    } catch (err) {
      setLoading(false);
      setIsError(true);
      setMessage(err.response?.data?.msg || "Signup failed. Try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#121212] text-white">
      <form
        onSubmit={handleSignup}
        className="p-8 bg-[#1a1a1a] rounded-2xl w-96 space-y-5 shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center mb-4 text-[#1db954]">
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 rounded bg-[#282828] text-white outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          {loading ? "Creating Account..." : "Sign Up"}
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
          Already have an account?{" "}
          <span
            className="text-[#1db954] cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Log In
          </span>
        </p>
      </form>
    </div>
  );
}
