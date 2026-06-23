"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
} from "framer-motion";
import Link from "next/link";
import "./collab.css";

/* ──────────────── Floating Orbs Background ──────────────── */
const orbs = [
  { size: 420, x: "10%", y: "8%", color: "rgba(217,122,60,0.18)", delay: 0 },
  { size: 320, x: "75%", y: "5%", color: "rgba(255,210,50,0.14)", delay: 1.2 },
  { size: 260, x: "50%", y: "30%", color: "rgba(217,122,60,0.12)", delay: 2.5 },
  { size: 380, x: "85%", y: "55%", color: "rgba(255,210,50,0.10)", delay: 0.8 },
  { size: 300, x: "15%", y: "65%", color: "rgba(217,122,60,0.14)", delay: 1.8 },
  { size: 200, x: "60%", y: "80%", color: "rgba(255,210,50,0.16)", delay: 3 },
];

function AnimatedBackground() {
  return (
    <div className="collab-bg-wrap" aria-hidden="true">
      {/* Grain / noise overlay */}
      <div className="collab-noise" />
      {/* Floating gradient orbs */}
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="collab-orb"
          style={{
            width: o.size,
            height: o.size,
            left: o.x,
            top: o.y,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: o.delay,
          }}
        />
      ))}
      {/* Slow rotating ring */}
      <motion.div
        className="collab-ring"
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/* ──────────────── Scroll‑reveal wrapper ──────────────── */
function Reveal({ children, direction = "up", delay = 0, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 60 : direction === "down" ? -60 : 0,
      x: direction === "left" ? 60 : direction === "right" ? -60 : 0,
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────── Parallax Section wrapper ──────────────── */
function ParallaxSection({ children, offset = 80, className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const smoothY = useSpring(y, { stiffness: 60, damping: 20 });

  return (
    <motion.div ref={ref} style={{ y: smoothY }} className={className}>
      {children}
    </motion.div>
  );
}

/* ──────────────── Stat Counter ──────────────── */
function StatCard({ number, label, suffix = "+", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      className="collab-stat"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <motion.span
        className="collab-stat-number"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: delay + 0.2 }}
      >
        {number}
        {suffix}
      </motion.span>
      <span className="collab-stat-label">{label}</span>
    </motion.div>
  );
}

/* ──────────────── Benefit card ──────────────── */
function BenefitCard({ icon, title, description, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="collab-benefit-card"
      initial={{ opacity: 0, y: 50, scale: 0.92 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.25 } }}
    >
      <div className="collab-benefit-icon">{icon}</div>
      <h3 className="collab-benefit-title">{title}</h3>
      <p className="collab-benefit-desc">{description}</p>
    </motion.div>
  );
}

/* ──────────────── Step card ──────────────── */
function StepCard({ number, title, description, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="collab-step"
      initial={{ opacity: 0, x: -40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <div className="collab-step-number">{number}</div>
      <div>
        <h3 className="collab-step-title">{title}</h3>
        <p className="collab-step-desc">{description}</p>
      </div>
    </motion.div>
  );
}

/* ──────────────── MAIN PAGE ──────────────── */
export default function CollabPage() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroTextY = useTransform(heroScroll, [0, 1], [0, 180]);
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);
  const heroBgScale = useTransform(heroScroll, [0, 1], [1, 1.15]);

  return (
    <div className="collab-page">
      <AnimatedBackground />

      {/* ═══════════ HERO ═══════════ */}
      <section ref={heroRef} className="collab-hero">
        <motion.div style={{ scale: heroBgScale }} className="collab-hero-bg" />

        <motion.div
          className="collab-hero-content"
          style={{ y: heroTextY, opacity: heroOpacity }}
        >
          <motion.div
            className="collab-hero-badge"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            ✦ Partner Program
          </motion.div>

          <motion.h1
            className="collab-hero-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            Collab with{" "}
            <span className="collab-hero-brand">Ithyaraa</span>
          </motion.h1>

          <motion.p
            className="collab-hero-sub"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            Join a thriving community of creators, influencers, and brands.
            <br />
            Together, let's redefine GenZ fashion and build something extraordinary.
          </motion.p>

          <motion.div
            className="collab-hero-cta-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
          >
            <a
              href="https://collab.ithyaraa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="collab-cta-primary"
            >
              <span>Start Collaborating</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#how-it-works" className="collab-cta-secondary">
              Learn More ↓
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="collab-scroll-indicator"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <div className="collab-scroll-dot" />
        </motion.div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="collab-section collab-stats-section">
        <ParallaxSection offset={40}>
          <div className="collab-stats-grid">
            <StatCard number="500" label="Active Creators" delay={0} />
            <StatCard number="2M" label="Combined Reach" suffix="" delay={0.15} />
            <StatCard number="50" label="Brand Partners" delay={0.3} />
            <StatCard number="10K" label="Monthly Orders via Collabs" delay={0.45} />
          </div>
        </ParallaxSection>
      </section>

      {/* ═══════════ WHY COLLAB ═══════════ */}
      <section className="collab-section">
        <Reveal>
          <h2 className="collab-section-title">
            Why <span className="collab-highlight">Collaborate</span> with Us?
          </h2>
          <p className="collab-section-sub">
            Whether you're a content creator, influencer, boutique brand, or fashion
            enthusiast — Ithyaraa offers a partnership built on growth, trust, and
            creativity.
          </p>
        </Reveal>

        <div className="collab-benefits-grid">
          <BenefitCard
            icon="💰"
            title="Earn Commission"
            description="Get attractive commission on every sale driven through your unique referral link. More sales, more earnings — no cap."
            delay={0}
          />
          <BenefitCard
            icon="🎨"
            title="Creative Freedom"
            description="Style it your way. Create content that resonates with your audience using our trendy, high-quality fashion products."
            delay={0.12}
          />
          <BenefitCard
            icon="📦"
            title="Free Product Drops"
            description="Receive exclusive product samples before launch. Be the first to showcase what's hot and trending."
            delay={0.24}
          />
          <BenefitCard
            icon="📊"
            title="Real-time Dashboard"
            description="Track your performance, commissions, and impact with a dedicated creator dashboard built just for you."
            delay={0.36}
          />
          <BenefitCard
            icon="🚀"
            title="Brand Amplification"
            description="Get featured on our social channels, website, and marketing campaigns. Grow your audience alongside ours."
            delay={0.48}
          />
          <BenefitCard
            icon="🤝"
            title="Dedicated Support"
            description="A dedicated partnership manager to help you succeed — from onboarding to campaign execution and beyond."
            delay={0.6}
          />
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="collab-section collab-how-section">
        <ParallaxSection offset={50}>
          <Reveal>
            <h2 className="collab-section-title">
              How it <span className="collab-highlight">Works</span>
            </h2>
            <p className="collab-section-sub">
              Getting started is simple. Four easy steps to launch your collaboration
              journey.
            </p>
          </Reveal>
        </ParallaxSection>

        <div className="collab-steps-container">
          <div className="collab-steps-line" />
          <StepCard
            number="01"
            title="Apply"
            description="Fill out a quick application form on our collab portal. Tell us about yourself, your audience, and your style."
            delay={0}
          />
          <StepCard
            number="02"
            title="Get Approved"
            description="Our team reviews your application and gets back within 48 hours. Once approved, you'll receive your welcome kit."
            delay={0.15}
          />
          <StepCard
            number="03"
            title="Create & Share"
            description="Receive products, create authentic content, and share with your audience using your unique tracking link."
            delay={0.3}
          />
          <StepCard
            number="04"
            title="Earn & Grow"
            description="Watch your earnings roll in. The more you create, the more you earn. Unlock higher tiers with exclusive perks."
            delay={0.45}
          />
        </div>
      </section>

      {/* ═══════════ WHO CAN JOIN ═══════════ */}
      <section className="collab-section">
        <Reveal>
          <h2 className="collab-section-title">
            Who Can <span className="collab-highlight">Join</span>?
          </h2>
        </Reveal>
        <div className="collab-who-grid">
          {[
            {
              emoji: "📸",
              title: "Content Creators",
              desc: "Instagram, YouTube, and TikTok creators passionate about fashion.",
            },
            {
              emoji: "🎤",
              title: "Influencers",
              desc: "Micro or macro — if you have an engaged audience, we want you.",
            },
            {
              emoji: "🏪",
              title: "Boutique Brands",
              desc: "Small fashion labels looking to cross-promote and reach new audiences.",
            },
            {
              emoji: "✍️",
              title: "Fashion Bloggers",
              desc: "Writers and stylists who can craft compelling fashion narratives.",
            },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.12} direction={i % 2 === 0 ? "left" : "right"}>
              <div className="collab-who-card">
                <span className="collab-who-emoji">{item.emoji}</span>
                <h3 className="collab-who-title">{item.title}</h3>
                <p className="collab-who-desc">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="collab-section collab-final-cta-section">
        <ParallaxSection offset={60}>
          <Reveal>
            <div className="collab-final-cta-box">
              <h2 className="collab-final-cta-title">
                Ready to Create Something
                <br />
                <span className="collab-highlight">Amazing Together?</span>
              </h2>
              <p className="collab-final-cta-sub">
                Join 500+ creators who are already collaborating with Ithyaraa. Your
                fashion journey starts here.
              </p>
              <motion.a
                href="https://collab.ithyaraa.com"
                target="_blank"
                rel="noopener noreferrer"
                className="collab-cta-primary collab-cta-large"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>Join as a Collaborator</span>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.a>
            </div>
          </Reveal>
        </ParallaxSection>
      </section>
    </div>
  );
}
