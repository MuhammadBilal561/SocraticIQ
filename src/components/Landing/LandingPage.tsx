import { useRef, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Brain,
  Code2,
  BarChart3,
  ArrowRight,
  Target,
  ChevronRight,
  Terminal,
  Cpu,
  Zap,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../store/AuthContext";
import Hero3D from "./Hero3D";

/* ───── helpers ───── */

function FadeInUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function NeonText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-neon-green glow-text ${className}`}>
      {children}
    </span>
  );
}

/* ───── Typewriter effect ───── */

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse text-neon-green">▊</span>}
    </span>
  );
}

/* ───── stats ───── */

const stats = [
  { value: "10+", label: "DSA Categories" },
  { value: "100+", label: "Coding Patterns" },
  { value: "Socratic", label: "AI Methodology" },
  { value: "99%", label: "Concept Retention" },
];

/* ───── features ───── */

const features = [
  {
    icon: Terminal,
    title: "Socratic Tutoring",
    description:
      "Instead of giving answers, our AI asks guided questions that lead you to the solution — building deep understanding that lasts.",
    borderColor: "border-neon-green/20",
    glowColor: "shadow-neon-green/20",
    iconColor: "text-neon-green",
  },
  {
    icon: Code2,
    title: "Live Code Editor",
    description:
      "Write and run code in a full-featured Monaco editor with syntax highlighting, auto-completion, and instant feedback on your approach.",
    borderColor: "border-neon-cyan/20",
    glowColor: "shadow-neon-cyan/20",
    iconColor: "text-neon-cyan",
  },
  {
    icon: Target,
    title: "Pattern Recognition",
    description:
      "Learn to identify the underlying patterns in any DSA problem — two pointers, sliding window, dynamic programming, and more.",
    borderColor: "border-neon-green/20",
    glowColor: "shadow-neon-green/20",
    iconColor: "text-neon-green",
  },
  {
    icon: BarChart3,
    title: "Mastery Tracking",
    description:
      "Track your progress across 10 DSA categories with detailed analytics. Know exactly where you excel and what needs more practice.",
    borderColor: "border-neon-cyan/20",
    glowColor: "shadow-neon-cyan/20",
    iconColor: "text-neon-cyan",
  },
];

/* ───── how it works ───── */

const steps = [
  {
    number: "01",
    title: "Pick a Problem",
    description: "Choose from a curated LeetCode problem or let us recommend one based on your mastery gaps.",
  },
  {
    number: "02",
    title: "Engage with Socratic AI",
    description: "The AI guides you through the problem with thoughtful questions, hints, and conceptual prompts — never spoiling the solution.",
  },
  {
    number: "03",
    title: "Write & Refine Code",
    description: "Implement your solution in the live editor. The AI reviews your approach and helps you optimise.",
  },
  {
    number: "04",
    title: "Track Your Mastery",
    description: "Each session updates your mastery dashboard. Watch your skills grow across every DSA category.",
  },
];

/* ───── main component ───── */

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Scanline CRT effect */}
      <div className="scanline" aria-hidden="true" />

      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-7 h-7 rounded-lg bg-neon-green/10 border border-neon-green/20 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-neon-green" />
          </div>
          <span className="font-heading font-bold text-sm text-neon-green/80">
            socratiq
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-code font-medium rounded-lg bg-neon-green text-black hover:shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all duration-150"
            >
              <Terminal className="w-3.5 h-3.5" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-code text-foreground/60 hover:text-neon-green/80 glass glass-hover rounded-lg transition-all duration-150 no-underline"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-code font-medium rounded-lg bg-neon-green text-black hover:shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all duration-150 no-underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* 3D background */}
      <motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
        <Hero3D />
      </motion.div>

      {/* subtle gradient overlay */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-b from-background/0 via-background/70 to-background" />

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-4xl mx-auto"
        >
          {/* terminal badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-code text-neon-green/70 mb-8 border-neon-green/20">
            <Terminal className="w-3.5 h-3.5 text-neon-green" />
            <span className="tracking-wider">$ ./socratiq --learn</span>
          </div>

          {/* headline with glitch */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Master DSA Interviews
            <br />
            with <NeonText>Socratic AI</NeonText>
          </h1>

          <p className="text-base sm:text-lg text-foreground/50 max-w-2xl mx-auto mb-10 leading-relaxed font-code">
            $ <TypewriterText text="Stop memorising solutions. Build genuine understanding with an AI tutor that asks the right questions." />
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/practice")}
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-neon-green text-black font-bold text-base font-code glow-green hover:shadow-[0_0_24px_rgba(0,255,65,0.5)] transition-shadow duration-200"
              >
                <Terminal className="w-4 h-4" />
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/signup")}
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-neon-green text-black font-bold text-base font-code glow-green hover:shadow-[0_0_24px_rgba(0,255,65,0.5)] transition-shadow duration-200"
              >
                <UserPlus className="w-4 h-4" />
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </motion.button>
            )}

            {user ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl glass glass-hover text-foreground/80 font-bold text-base font-code transition-all duration-200"
              >
                <Cpu className="w-4 h-4" />
                View Dashboard
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl glass glass-hover text-foreground/80 font-bold text-base font-code transition-all duration-200"
              >
                <LogIn className="w-4 h-4" />
                Sign In
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-neon-green/40 tracking-[0.2em] uppercase font-code">
            $ scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-neon-green/30 flex items-start justify-center pt-2"
          >
            <div className="w-1 h-2 rounded-full bg-neon-green/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Stats ─── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-neon-green/15 bg-neon-green/5">
            {stats.map((stat, i) => (
              <FadeInUp key={stat.label} delay={i * 0.1}>
                <div className="bg-background/80 backdrop-blur-sm px-6 py-8 text-center">
                  <div className="text-3xl md:text-4xl font-extrabold font-heading text-neon-green glow-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-foreground/40 font-code tracking-wide">
                    $ {stat.label.toLowerCase().replace(/\s+/g, '_')}
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="px-6 py-20 md:py-28" id="features">
        <div className="max-w-6xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">
                Why <NeonText>SocratIQ</NeonText>?
              </h2>
              <p className="text-foreground/50 text-base font-code max-w-2xl mx-auto">
                $ cat /etc/socratiq/advantages
              </p>
            </div>
          </FadeInUp>

          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {features.map((feature, i) => (
              <FadeInUp key={feature.title} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`group relative rounded-2xl border ${feature.borderColor} bg-surface/50 backdrop-blur-sm p-6 md:p-8 transition-all duration-300 hover:bg-surface-hover/80 hover:shadow-lg ${feature.glowColor}`}
                >
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-neon-green/5 border border-neon-green/15 flex items-center justify-center mb-5 ${feature.iconColor}`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading text-lg font-bold mb-2 text-foreground/90">{feature.title}</h3>
                    <p className="text-foreground/50 text-sm leading-relaxed font-code">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-[10px] text-neon-green/40 font-code">
                      <Zap className="w-3 h-3" />
                      <span>feature active</span>
                    </div>
                  </div>
                </motion.div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">
                How It <NeonText>Works</NeonText>
              </h2>
              <p className="text-foreground/50 text-base font-code max-w-2xl mx-auto">
                $ ./socratiq --guide
              </p>
            </div>
          </FadeInUp>

          <div className="relative">
            {/* vertical neon line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-neon-green/50 via-neon-cyan/40 to-neon-green/50 shadow-[0_0_8px_rgba(0,255,65,0.3)]" />

            <div className="space-y-12">
              {steps.map((step, i) => (
                <FadeInUp key={step.number} delay={i * 0.15}>
                  <div className="relative pl-16 md:pl-20">
                    {/* number circle with glow */}
                    <div className="absolute left-3 md:left-4 top-0 w-6 h-6 rounded-full bg-neon-green text-black flex items-center justify-center shadow-[0_0_12px_rgba(0,255,65,0.4)]">
                      <div className="w-2 h-2 rounded-full bg-black" />
                    </div>

                    <div className="terminal-border rounded-2xl p-6 md:p-8 bg-surface/40">
                      <span className="text-[10px] font-bold text-neon-green/70 tracking-[0.2em] uppercase font-code">
                        $ step_{step.number}
                      </span>
                      <h3 className="font-heading text-lg font-bold mt-1 mb-2 text-foreground/90">{step.title}</h3>
                      <p className="text-foreground/50 text-sm leading-relaxed font-code">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </FadeInUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="px-6 py-24 md:py-32">
        <FadeInUp>
          <div className="max-w-3xl mx-auto text-center">
            <div className="terminal-border rounded-3xl p-10 md:p-16 relative overflow-hidden bg-surface/30">
              {/* glow effects */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <Brain className="w-10 h-10 text-neon-green mx-auto mb-6 glow-text" />
                <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">
                  [ <NeonText>Ready to Master DSA?</NeonText> ]
                </h2>
                <p className="text-foreground/50 text-base font-code mb-8 max-w-xl mx-auto">
                  $ ./socratiq --join — guided questions, genuine understanding.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/practice")}
                  className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-neon-green text-black font-bold text-base font-code glow-green hover:shadow-[0_0_32px_rgba(0,255,65,0.5)] transition-shadow duration-200"
                >
                  <Terminal className="w-4 h-4" />
                  Start Your First Session
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </motion.button>
              </div>
            </div>
          </div>
        </FadeInUp>
      </section>

      {/* ─── Footer ─── */}
      <footer className="px-6 py-8 border-t border-neon-green/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-neon-green/40 text-sm font-code">
            <Terminal className="w-4 h-4" />
            <span className="font-medium">socratiq</span>
          </div>
          <p className="text-neon-green/20 text-xs font-code">
            $ echo "built for engineers who truly understand" &gt; /dev/null
          </p>
        </div>
      </footer>
    </div>
  );
}