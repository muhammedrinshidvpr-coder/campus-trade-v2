"use client";

import { useState, useEffect } from "react";
// 1. UPDATED IMPORT HERE
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

type Step = "email" | "otp" | "profile";

export default function AuthOnboarding() {
  // 2. UPDATED SUPABASE CONNECTION HERE
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Security Redirect & Profile Check
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Check if they actually finished setting up their profile
        const { data: profile } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          // They have a profile, send them to the app
          window.location.href = "/marketplace";
        } else {
          // They bypassed the profile step! Force them to finish it.
          setStep("profile");
        }
      }
    };
    checkUser();
  }, [supabase]);

  // State management
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@tkmce\.ac\.in$/;
    return emailRegex.test(email);
  };

  // WhatsApp validation
  const validateWhatsApp = (number: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers
    return phoneRegex.test(number);
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    //if (!validateEmail(email)) {
    //  setError("Please use your @tkmce.ac.in college email");
    //  return;
    //}

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) throw error;

      // Check if user profile exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user?.id)
        .single();

      if (existingUser) {
        // User already has a profile, redirect to home
        window.location.href = "/marketplace";
      } else {
        // New user, show profile form
        setStep("profile");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete profile
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters");
      return;
    }

    if (!validateWhatsApp(whatsapp)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No authenticated user found");

      const { error } = await supabase.from("users").insert({
        id: user.id,
        name: name.trim(),
        college_email: email,
        whatsapp_number: `+91${whatsapp}`,
      });

      if (error) throw error;

      // Redirect to home page
      window.location.href = "/marketplace";
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Clear the Ghost Session
  const handleStartOver = async () => {
    await supabase.auth.signOut();
    setStep("email");
    setEmail("");
    setOtp("");
    window.location.reload(); // Force refresh to clear Next.js cache
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-emerald-600 rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CampusTrade</h1>
          <p className="text-gray-400">Your campus marketplace</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <StepIndicator
              active={step === "email"}
              completed={step !== "email"}
            />
            <div
              className={`h-0.5 w-12 ${step !== "email" ? "bg-indigo-500" : "bg-gray-700"}`}
            />
            <StepIndicator
              active={step === "otp"}
              completed={step === "profile"}
            />
            <div
              className={`h-0.5 w-12 ${step === "profile" ? "bg-indigo-500" : "bg-gray-700"}`}
            />
            <StepIndicator active={step === "profile"} completed={false} />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <AnimatePresence mode="wait">
            {/* Step 1: Email Entry */}
            {step === "email" && (
              <motion.form
                key="email"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleSendOTP}
              >
                <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
                <p className="text-gray-400 mb-6">
                  Sign in with your college email to get started
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    College Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    placeholder="yourname@tkmce.ac.in"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </motion.form>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
              <motion.form
                key="otp"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleVerifyOTP}
              >
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-gray-400 hover:text-white mb-4 flex items-center text-sm transition"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Check your email
                </h2>
                <p className="text-gray-400 mb-6">
                  We sent a 6-digit code to{" "}
                  <span className="text-white font-medium">{email}</span>
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtp("");
                    setStep("email");
                  }}
                  className="w-full mt-3 text-sm text-gray-400 hover:text-white transition"
                >
                  Resend code
                </button>
              </motion.form>
            )}

            {/* Step 3: Profile Completion */}
            {step === "profile" && (
              <motion.form
                key="profile"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleCompleteProfile}
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  Complete your profile
                </h2>
                <p className="text-gray-400 mb-6">
                  Just a few more details to get you started
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      WhatsApp Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 bg-gray-900 border border-r-0 border-gray-700 rounded-l-lg text-gray-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) =>
                          setWhatsapp(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        placeholder="9876543210"
                        maxLength={10}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-r-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      We'll use this for buyer-seller communication
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Profile..." : "Complete Setup"}
                </button>

                {/* NEW START OVER BUTTON */}
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="w-full mt-4 text-sm text-gray-400 hover:text-white transition"
                >
                  Start Over / Sign Out
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 flex items-center justify-center space-x-6 text-gray-500 text-xs">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Secure & Encrypted
          </div>
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            College Verified
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Indicator Component
function StepIndicator({
  active,
  completed,
}: {
  active: boolean;
  completed: boolean;
}) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        completed
          ? "bg-indigo-500"
          : active
            ? "bg-indigo-500 ring-4 ring-indigo-500/30"
            : "bg-gray-700"
      }`}
    >
      {completed ? (
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <div
          className={`w-2 h-2 rounded-full ${active ? "bg-white" : "bg-gray-600"}`}
        />
      )}
    </div>
  );
}
