"use client";

import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface RegisterForm {
  email: string;
  password: string;
  role: "ADMIN" | "CLIENT";
}

export default function Register() {
  const { register: registerField, handleSubmit } = useForm<RegisterForm>();
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    setSuccess("");
    try {
      await registerUser(data.email, data.password, data.role);
      setSuccess("Registration successful! You can now log in.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="p-10 bg-black/80 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-white tracking-tight">Register</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7 w-full">
          <input
            type="email"
            {...registerField("email", { required: true })}
            placeholder="Email"
            className="w-full p-4 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition"
            autoComplete="username"
          />
          <input
            type="password"
            {...registerField("password", { required: true })}
            placeholder="Password"
            className="w-full p-4 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition"
            autoComplete="new-password"
          />
          <select
            {...registerField("role", { required: true })}
            className="w-full p-4 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            defaultValue="CLIENT"
          >
            <option value="CLIENT">Client</option>
            <option value="ADMIN">Admin</option>
          </select>
          {error && <div className="text-red-400 text-center">{error}</div>}
          {success && <div className="text-green-400 text-center">{success}</div>}
          <button type="submit" className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg transition text-lg tracking-wide">
            Register
          </button>
        </form>
        <button
          className="mt-6 text-blue-300 hover:underline text-sm"
          onClick={() => router.push("/login")}
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}
