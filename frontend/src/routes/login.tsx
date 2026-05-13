import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import "../landing/landing.css";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const IMAGES = [
  "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&auto=format&fit=crop",
];

function LoginPage() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt started", { email });
    
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      
      if (error) {
        console.error("Login error:", error);
        toast.error(error.message);
        setLoading(false);
      } else {
        console.log("Login success:", data);
        toast.success("Welcome back!");
        // We don't set loading false here because we're navigating
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      console.error("Unexpected error during login:", err);
      toast.error("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="dark" style={{ colorScheme: "dark" }}>
      <style>{`
        .reg-input::placeholder { color: oklch(0.55 0.02 260); }
        .reg-input:-webkit-autofill,
        .reg-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px oklch(0.19 0.028 265) inset !important;
          -webkit-text-fill-color: oklch(0.97 0.005 260) !important;
        }
        @media (max-width: 768px) {
          .reg-left-panel { display: none !important; }
          .reg-right-panel { padding: 40px 24px !important; width: 100% !important; }
          .reg-page-shell { flex-direction: column !important; }
          .reg-title { fontSize: 28px !important; }
        }
      `}</style>
      <div
        className="reg-page-shell"
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background: "oklch(0.13 0.022 265)",
          fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
        }}
      >
        <div
          className="reg-left-panel"
          style={{
            width: "45%",
            flexShrink: 0,
            margin: "16px",
            borderRadius: "20px",
            height: "calc(100vh - 32px)",
            position: "relative",
            overflow: "hidden",
            backgroundImage: `url('${IMAGES[currentImageIndex]}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "background-image 0.8s ease-in-out",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.15) 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              zIndex: 2,
              fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: "-0.02em",
              color: "white",
            }}
          >
            Vela
          </div>

          <Link
            to="/"
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              zIndex: 2,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 100,
              padding: "8px 18px",
              color: "white",
              fontSize: 13,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textDecoration: "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Back to website →
          </Link>

          <div
            style={{
              position: "absolute",
              bottom: 44,
              left: 28,
              zIndex: 2,
              color: "white",
              fontSize: 26,
              fontWeight: 500,
              lineHeight: 1.3,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Capturing Moments,
            <br />
            Creating Memories
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            {IMAGES.map((_, i) => {
              const active = i === currentImageIndex;
              return (
                <div
                  key={i}
                  style={{
                    height: 4,
                    borderRadius: 2,
                    width: active ? 36 : 24,
                    background: active ? "white" : "rgba(255,255,255,0.35)",
                    transition: "width 0.3s, background 0.3s",
                    cursor: "pointer",
                  }}
                  onClick={() => setCurrentImageIndex(i)}
                />
              );
            })}
          </div>
        </div>

        <div
          className="reg-right-panel"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 72px",
            background: "oklch(0.15 0.025 265)",
            overflowY: "auto",
          }}
        >
          <div style={{ width: "100%", maxWidth: "440px", margin: "0 auto" }}>
            <h1
              className="reg-title"
              style={{
                fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
                fontSize: 36,
                fontWeight: 700,
                color: "oklch(0.97 0.005 260)",
                marginBottom: 10,
                lineHeight: 1.15,
              }}
            >
              Welcome back
            </h1>

            <p
              style={{
                fontSize: 14,
                color: "oklch(0.68 0.02 260)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "var(--lp-blue-primary)",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  transition: "opacity 0.2s",
                }}
              >
                Sign up
              </Link>
            </p>

            <form
              onSubmit={handleLogin}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginTop: 28,
              }}
            >
              <InputField
                id="login-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={setEmail}
              />

              <div style={{ position: "relative" }}>
                <InputField
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={setPassword}
                  paddingRight={46}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "oklch(0.68 0.02 260)",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: loading ? "oklch(0.28 0.03 265)" : "var(--lp-blue-primary)",
                  border: "none",
                  borderRadius: "calc(0.75rem + 4px)",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s, box-shadow 0.2s",
                  boxShadow: loading ? "none" : "0 4px 24px var(--lp-blue-primary)",
                  marginTop: 10,
                }}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 13,
                  color: "oklch(0.68 0.02 260)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "oklch(0.28 0.03 265)",
                  }}
                />
                Or login with
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "oklch(0.28 0.03 265)",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <SocialButton 
                  id="login-google" 
                  label="Google"
                  onClick={handleGoogleLogin}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.14z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.5-1.45-.79-3-.79-4.59s.29-3.14.79-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                  </svg>
                </SocialButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  paddingRight,
}: {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  paddingRight?: number;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="reg-input"
      style={{
        flex: 1,
        width: "100%",
        background: "oklch(0.19 0.028 265)",
        border: `1px solid ${focused ? "var(--lp-blue-primary)" : "oklch(0.28 0.03 265)"}`,
        borderRadius: "calc(0.75rem + 4px)",
        padding: "14px 16px",
        paddingRight: paddingRight ?? 16,
        color: "oklch(0.97 0.005 260)",
        fontSize: 14,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: focused
          ? "0 0 0 3px rgba(56, 189, 248, 0.15)"
          : "none",
      }}
    />
  );
}

function SocialButton({
  id,
  label,
  children,
  onClick,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        maxWidth: "400px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "13px",
        background: hovered
          ? "oklch(0.22 0.03 265)"
          : "oklch(0.19 0.028 265)",
        border: `1px solid ${hovered ? "var(--lp-blue-primary)" : "oklch(0.28 0.03 265)"}`,
        borderRadius: "calc(0.75rem + 4px)",
        color: "oklch(0.97 0.005 260)",
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      {children}
      {label}
    </button>
  );
}
