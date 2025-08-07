'use client';
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");

  // Password validation function
  const isValidPassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return setStatus("❌ Passwords do not match");
    }

    if (!isValidPassword(password)) {
      return setStatus("❌ Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.");
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setStatus(data.message || data.error);
    } catch (err) {
      setStatus("❌ Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm"
              placeholder="Re-enter new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition duration-200"
          >
            Reset Password
          </button>
        </form>

        {status && (
          <p className={`mt-4 text-center text-sm ${status.includes("❌") ? "text-red-600" : "text-green-600"}`}>
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
