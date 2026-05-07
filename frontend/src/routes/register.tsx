import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import "../landing/landing.css";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const IMAGES = [
  "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&auto=format&fit=crop",
];

function RegisterPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("You must agree to the Terms & Conditions.");
      return;
    }
    
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Registration successful! Please check your email to verify your account.");
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

  const handleAppleLogin = () => {
    toast.info("Apple login is coming soon!");
  };

  return (
    <div className="dark" style={{ colorScheme: "dark" }}>
      {/* Scoped styles — placeholder color and autofill override */}
      <style>{`
        .reg-input::placeholder { color: oklch(0.55 0.02 260); }
        .reg-input:-webkit-autofill,
        .reg-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px oklch(0.19 0.028 265) inset !important;
          -webkit-text-fill-color: oklch(0.97 0.005 260) !important;
        }
      `}</style>
      {/* ── PAGE SHELL ── */}
      <div
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background: "oklch(0.13 0.022 265)", // --sidebar (darkest bg)
          fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
        }}
      >
        {/* ══════════════════════════════════════════
            LEFT PANEL — image + overlay
        ══════════════════════════════════════════ */}
        <div
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
          {/* Gradient overlay — matches landing card: bg-black/70 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.15) 100%)",
            }}
          />

          {/* TOP LEFT — Logo, font matches landing "FocusUp" wordmark style */}
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
            FocusUp
            <sup style={{ color: "var(--lp-cyan-accent)", fontSize: "0.5em", marginLeft: 2 }}>AI</sup>
          </div>

          {/* TOP RIGHT — Back button: matches landing pill nav buttons */}
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
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(255,255,255,0.22)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(255,255,255,0.12)")
            }
          >
            Back to website →
          </Link>

          {/* BOTTOM LEFT — Tagline */}
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

          {/* BOTTOM CENTER — Slider dots */}
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

        {/* ══════════════════════════════════════════
            RIGHT PANEL — form
        ══════════════════════════════════════════ */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 72px",
            background: "oklch(0.15 0.025 265)", // --background dark
            overflowY: "auto",
          }}
        >
          {/* Heading — matches landing h2 rhythm */}
          <h1
            style={{
              fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
              fontSize: 36,
              fontWeight: 700,
              color: "oklch(0.97 0.005 260)", // --foreground dark
              marginBottom: 10,
              lineHeight: 1.15,
            }}
          >
            Create an account
          </h1>

          {/* Subtext — matches landing body text style */}
          <p
            style={{
              fontSize: 14,
              color: "oklch(0.68 0.02 260)", // --muted-foreground dark
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              style={{
                color: "var(--lp-blue-primary)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.75")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
              }
            >
              Log in
            </a>
          </p>

          {/* ── FORM ── */}
          <form
            onSubmit={handleRegister}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginTop: 28,
            }}
          >
            {/* Row 1: First + Last name */}
            <div style={{ display: "flex", gap: 12 }}>
              <InputField
                id="reg-first-name"
                placeholder="First name"
                value={firstName}
                onChange={setFirstName}
              />
              <InputField
                id="reg-last-name"
                placeholder="Last name"
                value={lastName}
                onChange={setLastName}
              />
            </div>

            {/* Row 2: Email */}
            <InputField
              id="reg-email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
            />

            {/* Row 3: Password with eye toggle */}
            <div style={{ position: "relative" }}>
              <InputField
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                paddingRight={46}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "oklch(0.68 0.02 260)", // --muted-foreground
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.97 0.005 260)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.68 0.02 260)")
                }
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {/* Checkbox — matches landing's checked primary color */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "oklch(0.68 0.02 260)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                cursor: "pointer",
              }}
            >
              <input
                id="reg-terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ display: "none" }}
              />
              {/* Custom checkbox */}
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  border: `2px solid ${agreed ? "var(--lp-blue-primary)" : "oklch(0.28 0.03 265)"}`,
                  background: agreed
                    ? "var(--lp-blue-primary)"
                    : "oklch(0.19 0.028 265)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.2s, border-color 0.2s",
                }}
              >
                {agreed && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                  >
                    <path
                      d="M1.5 5L4 7.5L8.5 2.5"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              I agree to the{" "}
              <a
                href="#"
                style={{
                  color: "var(--lp-blue-primary)",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                Terms &amp; Conditions
              </a>
            </label>

            {/* PRIMARY BUTTON — identical to landing "Get Started" pill button pattern but full-width block */}
            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                background: loading ? "oklch(0.28 0.03 265)" : "var(--lp-blue-primary)",
                border: "none",
                borderRadius: "calc(0.75rem + 4px)", // --radius-xl
                color: "white",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s, box-shadow 0.2s",
                boxShadow: loading ? "none" : "0 4px 24px var(--lp-blue-primary)",
              }}
              onMouseEnter={(e) => {
                if (loading) return;
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 32px var(--lp-blue-primary)";
              }}
              onMouseLeave={(e) => {
                if (loading) return;
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 24px var(--lp-blue-primary)";
              }}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            {/* DIVIDER — matches landing's --border dark */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 13,
                color: "oklch(0.68 0.02 260)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "oklch(0.28 0.03 265)",
                }}
              />
              Or register with
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "oklch(0.28 0.03 265)",
                }}
              />
            </div>

            {/* SOCIAL BUTTONS — matches landing ghost pill button: bg-white/[0.05] rounded-full hover:bg-[--lp-blue-primary] */}
            <div style={{ display: "flex", gap: 12 }}>
              <SocialButton 
                id="reg-google" 
                label="Google"
                onClick={handleGoogleLogin}
              >
                {/* Google colour logo */}
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

              <SocialButton 
                id="reg-apple" 
                label="Apple"
                onClick={handleAppleLogin}
              >
                {/* Apple logo */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </SocialButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Shared Input component — matches landing input style: dark bg, border-[--border], rounded-xl, focus ring --primary ── */
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
        background: "oklch(0.19 0.028 265)", // --card dark
        border: `1px solid ${focused ? "var(--lp-blue-primary)" : "oklch(0.28 0.03 265)"}`, // --border dark / --primary
        borderRadius: "calc(0.75rem + 4px)", // --radius-xl = 16px
        padding: "14px 16px",
        paddingRight: paddingRight ?? 16,
        color: "oklch(0.97 0.005 260)", // --foreground dark
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

/* ── Social Button — matches landing ghost buttons: bg-white/[0.05] border border-[--lp-border] rounded-full ── */
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
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "13px",
        background: hovered
          ? "oklch(0.22 0.03 265)" // --sidebar-accent hover
          : "oklch(0.19 0.028 265)", // --card dark
        border: `1px solid ${hovered ? "var(--lp-blue-primary)" : "oklch(0.28 0.03 265)"}`,
        borderRadius: "calc(0.75rem + 4px)", // --radius-xl
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
