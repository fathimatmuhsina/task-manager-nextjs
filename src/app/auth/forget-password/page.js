'use client';
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Sending...");

    const res = await fetch("/api/auth/forget-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setStatus(data.message || data.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200"
          >
            Send Reset Link
          </button>
        </form>
        {status && (
          <p className="mt-4 text-center text-sm text-gray-600">
            {status}
          </p>
        )}
        <div className="mt-6 text-center">
          <a href="/auth/signin" className="text-blue-600 hover:underline text-sm">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
