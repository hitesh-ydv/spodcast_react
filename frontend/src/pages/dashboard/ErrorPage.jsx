// src/pages/ErrorPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#121212] text-white px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-6">Page Not Found</h2>
      <p className="text-gray-400 mb-6">
        Oops! The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="bg-green-600 px-6 py-3 rounded-full font-semibold hover:bg-green-500 transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default ErrorPage;
