"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "~/app/_components/auth-provider";
import { api } from "~/trpc/react";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const sendOtpMutation = api.auth.sendOtp.useMutation({
    onSuccess: () => {
      setStep("otp");
      setError("");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const verifyOtpMutation = api.auth.verifyOtp.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("sessionId", data.sessionId);
      window.location.href = "/";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    sendOtpMutation.mutate({ email });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    verifyOtpMutation.mutate({ email, otp });
  };

  if (isLoading || isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-white">Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-slate-800">
          LaundryApp
        </h1>
        <p className="mb-8 text-center text-slate-500">
          Track your laundry across multiple shops
        </p>

        {step === "email" ? (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                required
              />
            </div>

            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={sendOtpMutation.isPending}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p className="mb-4 text-sm text-slate-600">
              We sent a 6-digit code to <strong>{email}</strong>
            </p>

            <div className="mb-4">
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-2xl tracking-widest text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                maxLength={6}
                required
              />
            </div>

            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={verifyOtpMutation.isPending || otp.length !== 6}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError("");
              }}
              className="mt-3 w-full text-sm text-slate-500 hover:text-slate-700"
            >
              ← Use different email
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
