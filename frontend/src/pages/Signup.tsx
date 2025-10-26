"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Pupil Component
interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY,
}: PupilProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

// EyeBall Component
interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

// Main Signup Component
export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [isChar1Blinking, setIsChar1Blinking] = useState(false);
  const [isChar2Blinking, setIsChar2Blinking] = useState(false);
  const [isChar3Blinking, setIsChar3Blinking] = useState(false);
  const [isChar4Blinking, setIsChar4Blinking] = useState(false);
  const [isChar5Blinking, setIsChar5Blinking] = useState(false);

  const char1Ref = useRef<HTMLDivElement>(null);
  const char2Ref = useRef<HTMLDivElement>(null);
  const char3Ref = useRef<HTMLDivElement>(null);
  const char4Ref = useRef<HTMLDivElement>(null);
  const char5Ref = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blinking effects for all characters
  useEffect(() => {
    const createBlinkEffect = (setBlinking: (value: boolean) => void) => {
      const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

      const scheduleBlink = (): number => {
        const blinkTimeout = window.setTimeout(() => {
          setBlinking(true);
          window.setTimeout(() => {
            setBlinking(false);
            scheduleBlink();
          }, 150);
        }, getRandomBlinkInterval());

        return blinkTimeout;
      };

      return scheduleBlink();
    };

    const timeout1 = createBlinkEffect(setIsChar1Blinking);
    const timeout2 = createBlinkEffect(setIsChar2Blinking);
    const timeout3 = createBlinkEffect(setIsChar3Blinking);
    const timeout4 = createBlinkEffect(setIsChar4Blinking);
    const timeout5 = createBlinkEffect(setIsChar5Blinking);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
      clearTimeout(timeout5);
    };
  }, []);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

    return { faceX, faceY, bodySkew };
  };

  const char1Pos = calculatePosition(char1Ref);
  const char2Pos = calculatePosition(char2Ref);
  const char3Pos = calculatePosition(char3Ref);
  const char4Pos = calculatePosition(char4Ref);
  const char5Pos = calculatePosition(char5Ref);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:8000/signup", {
        email,
        password,
      });
      setMessage("Signup successful! Redirecting to login...");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-black p-8 relative overflow-hidden">
      {/* Left Characters (3 characters) - INCREASED SIZE */}
      <div className="absolute left-0 top-0 h-full w-1/3 flex items-center justify-center">
        <div className="relative" style={{ width: '550px', height: '650px' }}>
          {/* Purple character - Left */}
          <div
            ref={char1Ref}
            className="absolute bottom-0 transition-all duration-700 ease-in-out"
            style={{
              left: '20px',
              width: '160px',
              height: '380px',
              backgroundColor: '#8B5CF6',
              borderRadius: '80px 80px 0 0',
              zIndex: 1,
              transform: `skewX(${char1Pos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <div
              className="absolute flex gap-8 transition-all duration-200 ease-out"
              style={{
                left: `${48 + (char1Pos.faceX || 0) * 1.3}px`,
                top: `${60 + (char1Pos.faceY || 0) * 1.3}px`,
              }}
            >
              <Pupil size={18} maxDistance={7} pupilColor="#2D2D2D" />
              <Pupil size={18} maxDistance={7} pupilColor="#2D2D2D" />
            </div>
          </div>

          {/* Green character - Middle */}
          <div
            ref={char2Ref}
            className="absolute bottom-0 transition-all duration-700 ease-in-out"
            style={{
              left: '180px',
              width: '190px',
              height: '440px',
              backgroundColor: '#10B981',
              borderRadius: '12px 12px 0 0',
              zIndex: 2,
              transform: `skewX(${char2Pos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <div
              className="absolute flex gap-10 transition-all duration-700 ease-in-out"
              style={{
                left: `${55 + char2Pos.faceX * 1.3}px`,
                top: `${48 + char2Pos.faceY * 1.3}px`,
              }}
            >
              <EyeBall
                size={26}
                pupilSize={11}
                maxDistance={7}
                eyeColor="white"
                pupilColor="#2D2D2D"
                isBlinking={isChar1Blinking}
              />
              <EyeBall
                size={26}
                pupilSize={11}
                maxDistance={7}
                eyeColor="white"
                pupilColor="#2D2D2D"
                isBlinking={isChar1Blinking}
              />
            </div>
          </div>

          {/* Pink character - Right */}
          <div
            ref={char3Ref}
            className="absolute bottom-0 transition-all duration-700 ease-in-out"
            style={{
              left: '365px',
              width: '150px',
              height: '330px',
              backgroundColor: '#EC4899',
              borderRadius: '75px 75px 0 0',
              zIndex: 3,
              transform: `skewX(${char3Pos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <div
              className="absolute flex gap-7 transition-all duration-200 ease-out"
              style={{
                left: `${44 + (char3Pos.faceX || 0) * 1.3}px`,
                top: `${52 + (char3Pos.faceY || 0) * 1.3}px`,
              }}
            >
              <Pupil size={17} maxDistance={7} pupilColor="#2D2D2D" />
              <Pupil size={17} maxDistance={7} pupilColor="#2D2D2D" />
            </div>
            <div
              className="absolute w-20 h-[5px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
              style={{
                left: `${38 + (char3Pos.faceX || 0) * 1.3}px`,
                top: `${102 + (char3Pos.faceY || 0) * 1.3}px`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Characters (2 characters) - INCREASED SIZE */}
      <div className="absolute right-0 top-0 h-full w-1/3 flex items-center justify-center">
        <div className="relative" style={{ width: '480px', height: '650px' }}>
          {/* Cyan character - Left */}
          <div
            ref={char4Ref}
            className="absolute bottom-0 transition-all duration-700 ease-in-out"
            style={{
              left: '30px',
              width: '200px',
              height: '480px',
              backgroundColor: '#06B6D4',
              borderRadius: '14px 14px 0 0',
              zIndex: 1,
              transform: `skewX(${char4Pos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <div
              className="absolute flex gap-11 transition-all duration-700 ease-in-out"
              style={{
                left: `${60 + char4Pos.faceX * 1.3}px`,
                top: `${55 + char4Pos.faceY * 1.3}px`,
              }}
            >
              <EyeBall
                size={28}
                pupilSize={12}
                maxDistance={8}
                eyeColor="white"
                pupilColor="#2D2D2D"
                isBlinking={isChar4Blinking}
              />
              <EyeBall
                size={28}
                pupilSize={12}
                maxDistance={8}
                eyeColor="white"
                pupilColor="#2D2D2D"
                isBlinking={isChar4Blinking}
              />
            </div>
          </div>

          {/* Yellow character - Right */}
          <div
            ref={char5Ref}
            className="absolute bottom-0 transition-all duration-700 ease-in-out"
            style={{
              left: '230px',
              width: '180px',
              height: '370px',
              backgroundColor: '#F59E0B',
              borderRadius: '90px 90px 0 0',
              zIndex: 2,
              transform: `skewX(${char5Pos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <div
              className="absolute flex gap-8 transition-all duration-200 ease-out"
              style={{
                left: `${52 + (char5Pos.faceX || 0) * 1.3}px`,
                top: `${58 + (char5Pos.faceY || 0) * 1.3}px`,
              }}
            >
              <Pupil size={19} maxDistance={8} pupilColor="#2D2D2D" />
              <Pupil size={19} maxDistance={8} pupilColor="#2D2D2D" />
            </div>
            <div
              className="absolute w-24 h-[6px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
              style={{
                left: `${42 + (char5Pos.faceX || 0) * 1.3}px`,
                top: `${117 + (char5Pos.faceY || 0) * 1.3}px`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Decorative elements with neon glow */}
      <div className="absolute inset-0 bg-[size:20px_20px] opacity-5" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(to right, white 1px, transparent 1px)' }} />
      <div className="absolute top-1/4 right-1/3 size-96 bg-cyan-400/20 rounded-full blur-3xl" style={{ boxShadow: '0 0 100px 40px rgba(34, 211, 238, 0.3)' }} />
      <div className="absolute bottom-1/4 left-1/3 size-96 bg-purple-500/15 rounded-full blur-3xl" style={{ boxShadow: '0 0 100px 40px rgba(168, 85, 247, 0.25)' }} />
      <div className="absolute top-1/2 left-1/2 size-72 bg-pink-500/10 rounded-full blur-3xl" style={{ boxShadow: '0 0 80px 30px rgba(236, 72, 153, 0.2)' }} />

      {/* Center Form */}
      <div className="relative z-10 w-full max-w-[450px] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">
            Create an Account
          </h1>
          <p className="text-gray-500 text-sm">Please fill in your details to sign up</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-900">Email</label>
            <input
              id="email"
              type="email"
              placeholder="anna@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-900">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                {showPassword ? (
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                {showConfirmPassword ? (
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-3 text-sm rounded-lg border ${message.includes('successful') ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-12 text-base font-medium inline-flex items-center justify-center whitespace-nowrap rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-gray-900 font-medium hover:underline">
            Log in here
          </a>
        </div>
      </div>
    </div>
  );
}
