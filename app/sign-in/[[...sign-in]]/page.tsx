"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      console.log("Signing in with:", { email: trimmedEmail, passwordLength: trimmedPassword.length });
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { getFirebaseAuth } = await import("@/lib/firebase");
      const auth = await getFirebaseAuth();
      await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      router.push("/");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign in";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen" style={{ backgroundColor: "#0A0800" }}>
      {/* Top bar with logo and home button */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-4 z-10">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/bg_empty_logo.png"
            alt="Shop Logo"
            width={120}
            height={120}
            priority
            className="rounded"
          />
        </Link>
      </div>
      {/* Left: Form and Headings */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-8 gap-6 min-h-screen">
        <div className="w-full max-w-sm mt-20 md:mt-0">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Sign In</h1>
          <p className="text-sm text-gray-400 mb-6">
            Sign in to access the admin dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-900/50 border border-red-700 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white placeholder-gray-500 focus:border-[#F5A623] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                placeholder="admin@gmail.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white placeholder-gray-500 focus:border-[#F5A623] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md py-2 px-4 font-medium text-black transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#F5A623" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
      {/* Right: Image */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-muted">
        <Image
          src="/auth.png"
          alt="auth"
          width={700}
          height={700}
          className="object-contain"
        />
      </div>
      {/* Mobile Image */}
      <div className="hidden w-full justify-center mb-4">
        <Image
          src="/auth.png"
          alt="auth"
          width={200}
          height={200}
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default SignInPage;
