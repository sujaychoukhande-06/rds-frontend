"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const [email,       setEmail]       = useState("");
  const [pass,        setPass]        = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");
  const [focused,     setFocused]     = useState<string|null>(null);
  const [mounted,     setMounted]     = useState(false);
  const [successName, setSuccessName] = useState("");
  const [tilt,        setTilt]        = useState({ x: 0, y: 0 });
  const [typedText,   setTypedText]   = useState("");
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const animRef    = useRef<number>(0);

  const HEADLINES = ["Secure Access."];
  const fullText  = HEADLINES.join("  ·  ");

  // Typing animation
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) i = 0;
    }, 60);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && sessionStorage.getItem("rds_user")) router.replace("/");
  }, [router]);

  // Aurora canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let t = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    // Particles
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r:  Math.random() * 1.8 + 0.4,
      o:  Math.random() * 0.35 + 0.08,
    }));

    const draw = () => {
      t += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Aurora blobs
      const blobs = [
        { x: canvas.width * 0.15 + Math.sin(t * 0.7) * 80,  y: canvas.height * 0.2 + Math.cos(t * 0.5) * 60,  r: 350, c1: "rgba(29,78,216,0.22)",  c2: "transparent" },
        { x: canvas.width * 0.85 + Math.cos(t * 0.6) * 70,  y: canvas.height * 0.75 + Math.sin(t * 0.8) * 50, r: 300, c1: "rgba(6,182,212,0.14)",   c2: "transparent" },
        { x: canvas.width * 0.5  + Math.sin(t * 0.4) * 100, y: canvas.height * 0.5  + Math.cos(t * 0.9) * 80, r: 250, c1: "rgba(124,58,237,0.10)",  c2: "transparent" },
        { x: canvas.width * 0.7  + Math.cos(t * 1.1) * 60,  y: canvas.height * 0.15 + Math.sin(t * 0.6) * 40, r: 200, c1: "rgba(16,185,129,0.08)",  c2: "transparent" },
      ];

      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.c1);
        g.addColorStop(1, b.c2);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Particles
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,184,${p.o})`;
        ctx.fill();
      });

      // Lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(96,165,250,${0.06 * (1 - d/90)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  // 3D tilt on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -6, y: dx * 6 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!email || !pass) { setError("Please enter your credentials."); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid credentials."); setLoading(false); return; }
      sessionStorage.setItem("rds_user", JSON.stringify({ name: data.user.name, role: data.user.role, email: data.user.email }));
      setSuccessName(data.user.name);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => router.push("/"), 2200);
    } catch {
      setError("Cannot reach server. Check your connection.");
      setLoading(false);
    }
  };

  const cardStyle = {
    transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
    transition: tilt.x === 0 && tilt.y === 0 ? "transform 0.6s cubic-bezier(0.23,1,0.32,1)" : "transform 0.1s ease",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{height:100%;font-family:'Sora',sans-serif;background:#020c1e;color:#fff;overflow:hidden;}

        .root{position:relative;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;}

        canvas{position:fixed;inset:0;z-index:0;pointer-events:none;}

        .grid{
          position:fixed;inset:0;z-index:1;pointer-events:none;
          background-image:
            linear-gradient(rgba(59,130,246,0.035) 1px,transparent 1px),
            linear-gradient(90deg,rgba(59,130,246,0.035) 1px,transparent 1px);
          background-size:72px 72px;
          mask-image:radial-gradient(ellipse 90% 90% at 50% 50%,black 20%,transparent 100%);
        }

        /* Scanline effect */
        .scanlines{
          position:fixed;inset:0;z-index:1;pointer-events:none;
          background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px);
        }

        .layout{
          position:relative;z-index:10;
          display:flex;align-items:center;
          gap:80px;
          padding:0 40px;
          width:100%;max-width:1100px;
        }

        /* Left side text */
        .left{flex:1;min-width:0;}
        .eyebrow{
          display:inline-flex;align-items:center;gap:8px;
          background:rgba(37,99,235,0.12);
          border:1px solid rgba(37,99,235,0.25);
          border-radius:100px;padding:6px 16px;
          margin-bottom:32px;
        }
        .eyebrow-dot{width:7px;height:7px;border-radius:50%;background:#3b82f6;box-shadow:0 0 10px rgba(59,130,246,0.8);animation:epulse 2s ease-in-out infinite;}
        @keyframes epulse{0%,100%{opacity:1;box-shadow:0 0 10px rgba(59,130,246,0.8);}50%{opacity:0.5;box-shadow:0 0 4px rgba(59,130,246,0.4);}}
        .eyebrow-text{font-size:11px;font-weight:700;color:rgba(59,130,246,0.9);letter-spacing:1.5px;text-transform:uppercase;font-family:'JetBrains Mono',monospace;}

        .main-title{
          font-size:56px;font-weight:900;line-height:1.05;
          letter-spacing:-2px;margin-bottom:20px;
          background:linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.75) 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
        }
        .accent{
          background:linear-gradient(135deg,#60a5fa,#06b6d4,#818cf8);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
        }

        .typewriter{
          font-size:14px;color:rgba(255,255,255,0.35);
          font-family:'JetBrains Mono',monospace;
          letter-spacing:0.5px;margin-bottom:48px;
          min-height:20px;
        }
        .cursor{display:inline-block;width:2px;height:14px;background:#60a5fa;margin-left:2px;animation:blink 1s step-end infinite;vertical-align:text-bottom;}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}

        .feature-cards{display:flex;flex-direction:column;gap:12px;}
        .feat{
          display:flex;align-items:center;gap:14px;
          padding:14px 18px;
          background:rgba(255,255,255,0.025);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px;
          transition:all 0.3s;
        }
        .feat:hover{background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.1);transform:translateX(4px);}
        .feat-icon{
          width:38px;height:38px;border-radius:11px;
          display:flex;align-items:center;justify-content:center;
          font-size:16px;flex-shrink:0;
        }
        .feat-text strong{display:block;font-size:13px;font-weight:700;color:rgba(255,255,255,0.85);margin-bottom:2px;}
        .feat-text span{font-size:11.5px;color:rgba(255,255,255,0.35);}

        /* Right: Card */
        .card-outer{
          width:440px;flex-shrink:0;
          opacity:0;transform:translateY(30px) scale(0.97);
          transition:opacity 0.8s cubic-bezier(0.23,1,0.32,1),transform 0.8s cubic-bezier(0.23,1,0.32,1);
          will-change:transform;
        }
        .card-outer.visible{opacity:1;transform:translateY(0) scale(1);}

        .card{
          background:rgba(8,18,45,0.82);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:28px;
          padding:44px 40px 40px;
          backdrop-filter:blur(40px);
          -webkit-backdrop-filter:blur(40px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.05) inset,
            0 50px 100px rgba(0,0,0,0.7),
            0 0 80px rgba(37,99,235,0.08);
          position:relative;overflow:hidden;
        }

        /* Shimmer on top edge */
        .card::before{
          content:'';position:absolute;
          top:-1px;left:15%;right:15%;height:1px;
          background:linear-gradient(90deg,transparent,rgba(96,165,250,0.8),rgba(167,139,250,0.6),rgba(96,165,250,0.8),transparent);
          animation:shimmer 4s ease-in-out infinite;
        }
        @keyframes shimmer{0%,100%{opacity:0.6;left:15%;right:15%;}50%{opacity:1;left:10%;right:10%;}}

        /* Glow corner */
        .card::after{
          content:'';position:absolute;
          bottom:-80px;right:-80px;
          width:200px;height:200px;
          background:radial-gradient(circle,rgba(37,99,235,0.15),transparent 70%);
          pointer-events:none;
        }

        /* Logo */
        .logo-row{display:flex;align-items:center;gap:13px;margin-bottom:30px;}
        .logo-mark{
          width:46px;height:46px;border-radius:15px;flex-shrink:0;
          background:linear-gradient(135deg,#2563eb,#1e40af);
          display:flex;align-items:center;justify-content:center;
          font-size:21px;font-weight:900;color:#fff;
          box-shadow:0 0 0 1px rgba(255,255,255,0.15) inset, 0 8px 32px rgba(37,99,235,0.5);
          position:relative;
        }
        .logo-mark::after{content:'';position:absolute;inset:0;border-radius:15px;background:linear-gradient(135deg,rgba(255,255,255,0.2),transparent 60%);pointer-events:none;}
        .logo-name{font-size:16px;font-weight:800;color:#fff;letter-spacing:-0.3px;}
        .logo-sub{font-size:10px;color:rgba(255,255,255,0.25);letter-spacing:1.8px;text-transform:uppercase;margin-top:2px;font-family:'JetBrains Mono',monospace;}

        /* Live badge */
        .live-badge{
          display:inline-flex;align-items:center;gap:7px;
          background:rgba(16,185,129,0.08);
          border:1px solid rgba(16,185,129,0.2);
          border-radius:100px;padding:5px 13px;margin-bottom:24px;
        }
        .live-dot{width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 10px rgba(16,185,129,0.9);animation:lpulse 2.5s ease-in-out infinite;}
        @keyframes lpulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(0.75);opacity:0.5;}}
        .live-text{font-size:10.5px;font-weight:600;color:rgba(16,185,129,0.85);letter-spacing:1.2px;text-transform:uppercase;font-family:'JetBrains Mono',monospace;}

        .card-title{font-size:27px;font-weight:900;color:#fff;letter-spacing:-0.8px;margin-bottom:5px;}
        .card-sub{font-size:13.5px;color:rgba(255,255,255,0.32);margin-bottom:30px;line-height:1.55;}

        /* Error */
        .err{
          display:flex;align-items:flex-start;gap:9px;
          background:rgba(239,68,68,0.07);
          border:1px solid rgba(239,68,68,0.18);
          border-left:3px solid rgba(239,68,68,0.6);
          border-radius:10px;padding:11px 14px;
          margin-bottom:20px;
          font-size:12.5px;color:#fca5a5;
          animation:errIn 0.3s ease both;
        }
        @keyframes errIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;}}

        /* Fields */
        .field{margin-bottom:16px;}
        .field-label{
          display:flex;align-items:center;gap:6px;
          font-size:10.5px;font-weight:700;
          color:rgba(255,255,255,0.3);
          letter-spacing:1.8px;text-transform:uppercase;
          margin-bottom:8px;
          font-family:'JetBrains Mono',monospace;
        }
        .label-line{flex:1;height:1px;background:rgba(255,255,255,0.04);}

        .input-shell{
          position:relative;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:13px;
          transition:all 0.3s cubic-bezier(0.23,1,0.32,1);
          overflow:hidden;
        }
        .input-shell::before{
          content:'';position:absolute;bottom:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,#2563eb,#06b6d4);
          transform:scaleX(0);transition:transform 0.3s cubic-bezier(0.23,1,0.32,1);
          transform-origin:left;
        }
        .input-shell.focused{
          background:rgba(37,99,235,0.07);
          border-color:rgba(37,99,235,0.4);
          box-shadow:0 0 0 3px rgba(37,99,235,0.08);
        }
        .input-shell.focused::before{transform:scaleX(1);}
        .input-shell.err-f{border-color:rgba(239,68,68,0.4);}

        .input-prefix{position:absolute;left:15px;top:50%;transform:translateY(-50%);opacity:0.28;pointer-events:none;}
        .field-input{
          width:100%;height:50px;background:transparent;border:none;outline:none;
          padding:0 46px 0 44px;
          font-size:14.5px;color:#fff;font-family:'Sora',sans-serif;letter-spacing:0.2px;
        }
        .field-input::placeholder{color:rgba(255,255,255,0.18);font-size:13.5px;}
        .eye-btn{
          position:absolute;right:13px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;padding:6px;
          color:rgba(255,255,255,0.2);transition:color 0.2s;
          display:flex;align-items:center;
        }
        .eye-btn:hover{color:rgba(255,255,255,0.55);}

        /* Extras */
        .extras{display:flex;align-items:center;justify-content:space-between;margin-bottom:26px;}
        .keep{display:flex;align-items:center;gap:8px;cursor:pointer;}
        .chk{
          width:19px;height:19px;border-radius:7px;
          background:#2563eb;border:1.5px solid #3b82f6;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 0 14px rgba(37,99,235,0.55);
          flex-shrink:0;
        }
        .keep-label{font-size:12.5px;color:rgba(255,255,255,0.35);font-weight:500;}
        .forgot{font-size:12.5px;color:rgba(96,165,250,0.75);font-weight:600;cursor:pointer;text-decoration:none;transition:color 0.2s;}
        .forgot:hover{color:#bfdbfe;}

        /* Submit */
        .submit-wrap{position:relative;margin-bottom:22px;}
        .submit{
          width:100%;height:52px;border:none;border-radius:15px;cursor:pointer;
          font-size:15px;font-weight:800;color:#fff;letter-spacing:0.2px;
          font-family:'Sora',sans-serif;
          background:linear-gradient(135deg,#2563eb 0%,#1e40af 45%,#1d4ed8 100%);
          box-shadow:0 8px 32px rgba(37,99,235,0.45),0 0 0 1px rgba(255,255,255,0.1) inset;
          transition:all 0.3s cubic-bezier(0.23,1,0.32,1);
          display:flex;align-items:center;justify-content:center;gap:10px;
          position:relative;overflow:hidden;
        }
        .submit::before{
          content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 50%);
          pointer-events:none;
        }
        .submit::after{
          content:'';position:absolute;
          top:0;left:-100%;width:50%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);
          transition:left 0.5s;
        }
        .submit:hover:not(:disabled)::after{left:150%;}
        .submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 14px 40px rgba(37,99,235,0.6),0 0 0 1px rgba(255,255,255,0.12) inset;}
        .submit:active:not(:disabled){transform:translateY(0);}
        .submit:disabled{opacity:0.75;cursor:not-allowed;}
        .submit-icon{font-size:16px;transition:transform 0.3s;}
        .submit:hover:not(:disabled) .submit-icon{transform:translateX(4px);}

        .spinner{width:19px;height:19px;border:2px solid rgba(255,255,255,0.25);border-top-color:#fff;border-radius:50%;animation:spin 0.65s linear infinite;flex-shrink:0;}
        @keyframes spin{to{transform:rotate(360deg);}}

        /* Divider */
        .div-row{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
        .div-line{flex:1;height:1px;background:rgba(255,255,255,0.06);}
        .div-text{font-size:10px;color:rgba(255,255,255,0.18);letter-spacing:1.5px;text-transform:uppercase;font-family:'JetBrains Mono',monospace;white-space:nowrap;}

        /* Badges */
        .badges{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;}
        .bdg{
          display:flex;align-items:center;gap:5px;
          background:rgba(255,255,255,0.025);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:100px;padding:4px 11px;
        }
        .bdg-icon{width:12px;height:12px;flex-shrink:0;}
        .bdg span{font-size:10px;color:rgba(255,255,255,0.22);font-weight:600;letter-spacing:0.5px;font-family:'JetBrains Mono',monospace;}

        /* Success */
        .success-wrap{display:flex;flex-direction:column;align-items:center;gap:18px;padding:12px 0 4px;text-align:center;}
        .s-ring-outer{
          width:88px;height:88px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          background:rgba(16,185,129,0.08);
          border:1px solid rgba(16,185,129,0.2);
          box-shadow:0 0 0 16px rgba(16,185,129,0.04),0 0 60px rgba(16,185,129,0.2);
          animation:sRingIn 0.6s cubic-bezier(0.23,1,0.32,1) both;
        }
        @keyframes sRingIn{from{transform:scale(0.3);opacity:0;}to{transform:scale(1);opacity:1;}}
        .s-ring-inner{
          width:64px;height:64px;border-radius:50%;
          background:rgba(16,185,129,0.15);
          border:2px solid rgba(16,185,129,0.5);
          display:flex;align-items:center;justify-content:center;
          animation:sRingIn 0.6s 0.1s cubic-bezier(0.23,1,0.32,1) both;
        }
        .s-title{font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;}
        .s-sub{font-size:13px;color:rgba(255,255,255,0.38);font-family:'JetBrains Mono',monospace;line-height:1.6;}
        .s-progress{width:100%;height:3px;background:rgba(255,255,255,0.07);border-radius:100px;overflow:hidden;margin-top:4px;}
        .s-fill{height:100%;border-radius:100px;background:linear-gradient(90deg,#10b981,#34d399,#6ee7b7);animation:sFill 2s ease both;}
        @keyframes sFill{from{width:0%;}to{width:100%;}}

        @media(max-width:900px){
          .left{display:none;}
          .card-outer{width:100%;max-width:440px;}
          .layout{justify-content:center;}
        }
        @media(max-width:480px){
          .card{padding:32px 24px 28px;}
          .card-title{font-size:22px;}
        }
      `}</style>

      <div className="root">
        <canvas ref={canvasRef} />
        <div className="grid" />
        <div className="scanlines" />

        <div className="layout">
          {/* LEFT */}
          <div className="left">
            <div className="eyebrow">
              <div className="eyebrow-dot" />
              <span className="eyebrow-text">Medical Infra RDS </span>
            </div>

            <h1 className="main-title">
              Enterprise<br />
              <span className="accent">Facility</span><br />
              Management
            </h1>

            <div className="typewriter">
              {typedText}<span className="cursor" />
            </div>

            <div className="feature-cards">
              {[
                { bg:"rgba(37,99,235,0.15)", border:"rgba(37,99,235,0.3)", icon:"🏥", title:"Multi-Department RDS",     desc:"Centralized room data across all clinical departments" },
                { bg:"rgba(6,182,212,0.12)",  border:"rgba(6,182,212,0.25)",  icon:"🤖", title:"AI-Powered Auto-Fill",    desc:"Extract fields instantly from Word & Excel documents" },
                { bg:"rgba(16,185,129,0.12)", border:"rgba(16,185,129,0.25)", icon:"📊", title:"Excel & PDF Export",      desc:"One-click exports saved to cloud storage automatically" },
              ].map(f => (
                <div key={f.title} className="feat">
                  <div className="feat-icon" style={{ background: f.bg, border: `1px solid ${f.border}` }}>{f.icon}</div>
                  <div className="feat-text">
                    <strong>{f.title}</strong>
                    <span>{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CARD */}
          <div
            className={`card-outer${mounted ? " visible" : ""}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="card" ref={cardRef} style={cardStyle}>
              {success ? (
                <div className="success-wrap">
                  <div className="s-ring-outer">
                    <div className="s-ring-inner">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <path d="M6 14.5l5.5 5.5L22 9" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className="s-title">Access granted</div>
                  <div className="s-sub">Welcome back, {successName}<br/>Loading your dashboard…</div>
                  <div className="s-progress"><div className="s-fill" /></div>
                </div>
              ) : (
                <>
                  <div className="logo-row">
                    <div className="logo-mark">R</div>
                    <div>
                      <div className="logo-name">RDS System</div>
                      <div className="logo-sub">Medical College · Secure Portal</div>
                    </div>
                  </div>

                  <div className="live-badge">
                    <div className="live-dot" />
                    <span className="live-text">All systems operational</span>
                  </div>

                  <div className="card-title">Welcome back</div>
                  <div className="card-sub">Sign in with your employee credentials to access the facility management dashboard.</div>

                  {error && (
                    <div className="err">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.5"/>
                        <path d="M8 5v3.5M8 10.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* Email */}
                  <div className="field">
                    <div className="field-label">
                      Employee ID / Email
                      <div className="label-line" />
                    </div>
                    <div className={`input-shell${focused === "email" ? " focused" : ""}${error && !email ? " err-f" : ""}`}>
                      <div className="input-prefix">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="5.5" r="2.5" stroke="white" strokeWidth="1.4"/>
                          <path d="M2 13.5c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        className="field-input"
                        placeholder="emp@medcollege.edu"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocused("email")}
                        onBlur={() => setFocused(null)}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="field">
                    <div className="field-label">
                      Password
                      <div className="label-line" />
                    </div>
                    <div className={`input-shell${focused === "pass" ? " focused" : ""}${error && !pass ? " err-f" : ""}`}>
                      <div className="input-prefix">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <rect x="3" y="7.5" width="10" height="6.5" rx="2" stroke="white" strokeWidth="1.4"/>
                          <path d="M5.5 7.5V5.5a2.5 2.5 0 015 0v2" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                          <circle cx="8" cy="10.5" r="1" fill="white" opacity="0.5"/>
                        </svg>
                      </div>
                      <input
                        type={showPass ? "text" : "password"}
                        className="field-input"
                        placeholder="Enter your password"
                        value={pass}
                        onChange={e => setPass(e.target.value)}
                        onFocus={() => setFocused("pass")}
                        onBlur={() => setFocused(null)}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                      />
                      <button className="eye-btn" onClick={() => setShowPass(p => !p)} type="button">
                        {showPass ? (
                          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                            <path d="M2 2l13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            <path d="M6.8 6.6a2.5 2.5 0 003.6 3.6M4.5 4.2C3.1 5.2 2 6.7 1.5 8.5c1.2 3.2 4 5.5 7 5.5 1.4 0 2.7-.5 3.8-1.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            <path d="M8.5 3C11.5 3 14.3 5.3 15.5 8.5c-.3.8-.7 1.5-1.2 2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                          </svg>
                        ) : (
                          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                            <path d="M1.5 8.5C2.7 5.3 5.5 3 8.5 3s5.8 2.3 7 5.5c-1.2 3.2-4 5.5-7 5.5S2.7 11.7 1.5 8.5z" stroke="currentColor" strokeWidth="1.4"/>
                            <circle cx="8.5" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="extras">
                    <div className="keep">
                      <div className="chk">
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path d="M2 5.5l2.5 2.5L9 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="keep-label">Keep me signed in</span>
                    </div>
                    <a className="forgot" href="#">Forgot password?</a>
                  </div>

                  <div className="submit-wrap">
                    <button className="submit" onClick={handleLogin} disabled={loading}>
                      {loading ? (
                        <><div className="spinner" />Authenticating…</>
                      ) : (
                        <>Sign In to RDS System <span className="submit-icon">→</span></>
                      )}
                    </button>
                  </div>

                  <div className="div-row">
                    <div className="div-line" />
                    <span className="div-text">256-bit encrypted · secured access</span>
                    <div className="div-line" />
                  </div>

                  <div className="badges">
                    {[
                      { color:"#60a5fa", label:"TLS 1.3" },
                      { color:"#34d399", label:"SOC 2" },
                      { color:"#a78bfa", label:"HIPAA" },
                      { color:"#f9a8d4", label:"ISO 27001" },
                      { color:"#fbbf24", label:"Cloud Secured" },
                    ].map(b => (
                      <div key={b.label} className="bdg">
                        <svg className="bdg-icon" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="4" fill={b.color} opacity="0.8"/>
                          <path d="M4 6l1.5 1.5L8 4.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{b.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
