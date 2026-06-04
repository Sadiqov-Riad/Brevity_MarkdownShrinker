"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header({ badgeText }: { badgeText: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  return (
    <header className="header">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", zIndex: 1000, position: "relative" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <h1>Brevity<span className="blink">_</span></h1>
        </Link>
        <span className="badge">{badgeText}</span>
      </div>

      <nav className="nav-links desktop-nav">
        <Link href="/#quick-start">Quick Start</Link>
        <Link href="/docs">Docs</Link>
        <Link href="/#reviews">Reviews</Link>
        <a href="https://github.com/Sadiqov-Riad/Brevity" target="_blank" rel="noopener noreferrer">GitHub</a>
      </nav>

      <button 
        className="burger-btn" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? "[X]" : "[☰]"}
      </button>

      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <nav className="mobile-nav-links">
          <Link href="/#quick-start" onClick={() => setIsMenuOpen(false)}>&gt; Quick Start</Link>
          <Link href="/docs" onClick={() => setIsMenuOpen(false)}>&gt; Docs</Link>
          <Link href="/#reviews" onClick={() => setIsMenuOpen(false)}>&gt; Reviews</Link>
          <a href="https://github.com/Sadiqov-Riad/Brevity" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>&gt; GitHub</a>
        </nav>
      </div>
    </header>
  );
}
