"use client";
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"collect" | "reset" | "done">("collect");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep("reset");
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill both password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // ✅ FIXED: Hardcoded API base for client-side
      const API_BASE = "http://localhost:8000";
      
      const res = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Failed to reset password");
      }
      
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">Password reset successful</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Your password has been updated for:
          </p>
          <div className="mb-4 text-left border rounded p-3">
            <div>
              <strong>Email:</strong> {email || "(none provided)"}
            </div>
          </div>
          <Link to="/login" className="text-sm text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-4">Reset password</h1>
          <p className="text-sm text-muted-foreground mb-6">
            For demo accounts we only validate locally. Enter a new password for{" "}
            <strong>{email || "your account"}</strong>.
          </p>

          <form onSubmit={handleResetSubmit} className="space-y-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-12 rounded-md border px-3 text-black"
              placeholder="New password (min 6 chars)"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 rounded-md border px-3 text-black"
              placeholder="Confirm new password"
            />

            {error && <div className="text-sm text-red-500">{error}</div>}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("collect")}
                className="text-sm hover:underline"
              >
                Back
              </button>
              <button type="submit" className="px-4 py-2 rounded bg-primary text-white">
                Reset password
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Default: collect email only
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Forgot password</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enter email. This is a dummy flow — no reset email will be sent.
        </p>

        <form onSubmit={handleCollectSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 rounded-md border px-3 text-black"
            placeholder="you@example.com"
            required
          />

          <div className="flex items-center justify-between">
            <Link to="/login" className="text-sm hover:underline">
              Back to login
            </Link>
            <button type="submit" className="px-4 py-2 rounded bg-primary text-white">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
