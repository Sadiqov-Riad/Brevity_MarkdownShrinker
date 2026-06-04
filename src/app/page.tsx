"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import Link from "next/link";
import Header from "@/components/Header";


const AnimatedSection = ({ children, className = "", delay = 0 }: { children: ReactNode, className?: string, delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className={`fade-up-section ${isVisible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const AnimatedNumber = ({ value, format }: { value: number, format: (v: number) => string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number;
    const duration = 800;
    const startValue = displayValue;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(startValue + (value - startValue) * ease);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{format(displayValue)}</>;
};

const SavingsEstimator = () => {
  const rawChars = 50000;
  const cleanChars = 30000;
  
  const tokensBefore = Math.floor(rawChars / 3.8);
  const tokensAfter = Math.floor(cleanChars / 3.8);

  const models = [
    { name: "Opus 4.8", pricePerM: 5.00, priceStr: "5.00" },
    { name: "Qwen 3.7 Plus", pricePerM: 0.21, priceStr: "0.210" },
    { name: "GPT-5.5", pricePerM: 5.00, priceStr: "5.00" }
  ];

  const runs = 10000; // 10k requests

  return (
    <section className="estimator-section block-card" style={{ marginBottom: '2rem' }}>
      <div className="estimator-header">
        <h2 className="estimator-title">Cost Savings Estimator</h2>
        <p className="estimator-desc">
          Compare the API cost of 10,000 requests using an example payload (50KB) before and after Brevity.
        </p>
      </div>

      <div className="estimator-grid">
        {models.map(model => {
          const costBefore = (tokensBefore / 1000000) * model.pricePerM * runs;
          const costAfter = (tokensAfter / 1000000) * model.pricePerM * runs;
          const savings = costBefore - costAfter;

          return (
            <div key={model.name} className="model-row">
              <div className="model-header">
                <span className="model-name">{model.name}</span>
                <span className="model-price-label">${model.priceStr} / 1M input tokens</span>
              </div>
              
              <div className="bars-container">
                <div className="bar-row">
                  <span className="bar-label">Before</span>
                  <div className="bar-track">
                    <div className="bar-fill before" style={{ width: "100%" }}></div>
                  </div>
                  <span className="bar-value">{tokensBefore.toLocaleString("en-US")} t</span>
                </div>
                <div className="bar-row">
                  <span className="bar-label">After</span>
                  <div className="bar-track">
                    <div className="bar-fill after" style={{ width: `${(tokensAfter / tokensBefore) * 100}%` }}></div>
                  </div>
                  <span className="bar-value">{tokensAfter.toLocaleString("en-US")} t</span>
                </div>
              </div>

              <div className="cost-comparison">
                <div className="cost-item">
                  <span className="cost-label">Old Cost</span>
                  <span className="cost-value strikethrough">${costBefore.toFixed(2)}</span>
                </div>
                <div className="cost-item savings">
                  <span className="cost-label">New Cost</span>
                  <span className="cost-value savings-text">${costAfter.toFixed(2)}</span>
                </div>
                <div className="cost-item savings">
                  <span className="cost-label">Savings (10k runs)</span>
                  <span className="cost-value savings-text">+ ${savings.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const SVG_PATTERN = /<svg[\s\S]*?>[\s\S]*?<\/svg>/gi;
const IMG_PATTERN = /!\[.*?\]\(.*?\)/g;
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const HTML_TAG_PATTERN = /<[^>]*>/g;
const UTM_PATTERN = /(\?|&)(utm_[^=\s]+=[^&\s]+|source=[^&\s]+|client=[^&\s]+|ref=[^&\s]+)/g;

function sanitizeMarkdown(content: string, options: { strip_svg: boolean, strip_img: boolean, clean_urls: boolean }): string {
  let result = content;

  if (options.strip_svg) {
    result = result.replace(SVG_PATTERN, "");
  }

  if (options.strip_img) {
    result = result.replace(IMG_PATTERN, "");
  }

  if (options.clean_urls) {
    result = result.replace(UTM_PATTERN, "");
  }

  // Always clean up residual HTML and comments for token safety
  result = result.replace(HTML_COMMENT_PATTERN, "");
  result = result.replace(HTML_TAG_PATTERN, "");

  // Fast collapse of extra spaces and line breaks
  const lines = result.split("\n");
  const cleanedLines: string[] = [];

  for (const line of lines) {
    if (line.trim()) {
      cleanedLines.push(line);
    } else if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] !== "") {
      cleanedLines.push("");
    }
  }

  return cleanedLines.join("\n").trim();
}

export default function Home() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [options, setOptions] = useState({
    strip_svg: true,
    strip_img: true,
    clean_urls: true,
  });



  const [stats, setStats] = useState<{
    time?: number;
    saved?: number;
    percent?: number;
  } | null>(null);

  const [qsCopied, setQsCopied] = useState(false);
  const [activeQsTab, setActiveQsTab] = useState('bash');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const qsOptions = [
    { id: 'bash', label: 'bash', code: 'git clone https://github.com/Sadiqov-Riad/Brevity.git && cd Brevity' },
    { id: 'powershell', label: 'powershell', code: 'git clone https://github.com/Sadiqov-Riad/Brevity.git; Set-Location Brevity' },
    { id: 'cmd', label: 'cmd', code: 'git clone https://github.com/Sadiqov-Riad/Brevity.git && cd Brevity' }
  ];

  const testimonials = [
    {
      quote: `"Brevity helped us ship more ships while shipping ships. Truly best-in-class shipping."`,
      author: "Generic Coder Guy",
      role: "Sr. Engineer, ShipShip Inc.",
      stars: 5
    },
    {
      quote: `"We cut our OpenAI API costs by 35% simply by piping our RAG documents through Brevity first. The latency is practically invisible."`,
      author: "Alex D.",
      role: "Lead AI Engineer",
      stars: 5
    },
    {
      quote: `"Finally, a tool that understands that LLMs don't need to read 50KB of inline SVGs. Brilliant and simple."`,
      author: "Sarah M.",
      role: "Full Stack Developer",
      stars: 5
    }
  ];

  const handleQsCopy = () => {
    const codeToCopy = qsOptions.find(o => o.id === activeQsTab)?.code || "";
    navigator.clipboard.writeText(codeToCopy);
    setQsCopied(true);
    setTimeout(() => setQsCopied(false), 2000);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleShrink = () => {
    if (!content.trim()) return;

    setLoading(true);
    setResult("");
    setStats(null);

    // Small delay to allow React to paint the loading state
    setTimeout(() => {
      try {
        const startTime = performance.now();
        const initialSize = content.length;

        const cleaned = sanitizeMarkdown(content, options);

        const endTime = performance.now();
        const processingTimeMs = endTime - startTime;

        const bytesSaved = Math.max(0, initialSize - cleaned.length);
        const savedPercent = initialSize > 0 ? (bytesSaved / initialSize) * 100 : 0;

        setResult(cleaned);
        setStats({
          time: processingTimeMs,
          saved: bytesSaved,
          percent: savedPercent,
        });
      } catch (err) {
        setResult("Error processing request on client.");
      } finally {
        setLoading(false);
      }
    }, 10);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  return (
    <div className="container">
      <Header badgeText="API v1.0" />

      <main>
        <p style={{ marginBottom: "2.5rem", color: "#888", maxWidth: "600px", lineHeight: "1.6" }}>
          Clean markdown files from visual noise in milliseconds. Save LLM tokens by stripping
          unnecessary SVGs, images, and tracking URLs. Terminal-grade precision.
        </p>

        <AnimatedSection className="main-grid" delay={100}>
          <div className="panel">
            <div className="panel-header">
              <span>Input.md</span>
              <span>{content.length} BYTES</span>
            </div>
            <div className="panel-content">
              <textarea
                className="textarea"
                placeholder="Paste your dirty markdown here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span>Output.md</span>
              {stats && <span>{result.length} BYTES</span>}
            </div>
            <div className="panel-content" style={{ position: "relative" }}>
              <textarea
                className="textarea"
                value={result}
                readOnly
                placeholder="Cleaned markdown will appear here."
                style={{ backgroundColor: "var(--panel-bg)" }}
                spellCheck={false}
              />
              {result && (
                <button
                  onClick={handleCopy}
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-color)",
                    color: "var(--fg-color)",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    fontFamily: "inherit",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                >
                  Copy
                </button>
              )}
            </div>
          </div>
          </AnimatedSection>

        <AnimatedSection className="controls" delay={200}>
          <label className="toggle">
            <input
              type="checkbox"
              checked={options.strip_svg}
              onChange={(e) => setOptions({ ...options, strip_svg: e.target.checked })}
            />
            Strip SVG
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={options.strip_img}
              onChange={(e) => setOptions({ ...options, strip_img: e.target.checked })}
            />
            Strip Images
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={options.clean_urls}
              onChange={(e) => setOptions({ ...options, clean_urls: e.target.checked })}
            />
            Clean URLs
          </label>

          <button
            className="btn"
            onClick={handleShrink}
            disabled={loading || !content.trim()}
            suppressHydrationWarning
          >
            {loading ? "PROCESSING..." : "EXECUTE // SHRINK"}
          </button>
        </AnimatedSection>

        <AnimatedSection className="stats" delay={300}>
          <div className="stat-item">
            <span className="stat-value">
              <AnimatedNumber value={stats?.time || 0} format={(v) => `${v.toFixed(2)}ms`} />
            </span>
            <span className="stat-label">Latency</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              <AnimatedNumber value={stats?.saved || 0} format={(v) => `${Math.floor(v)} B`} />
            </span>
            <span className="stat-label">Bytes Saved</span>
          </div>
          <div className="stat-item">
            <span className="stat-value accent-text">
              <AnimatedNumber value={stats?.percent || 0} format={(v) => `${v.toFixed(1)}%`} />
            </span>
            <span className="stat-label">Reduction</span>
          </div>
        </AnimatedSection>

        <div className="info-sections">
          {/* Section 1: Features */}
          <AnimatedSection className="about-section block-card" delay={200}>
            <h2 className="about-title"><span className="highlight">What is</span> Brevity?</h2>
            <p className="about-desc">
              Brevity is a microservice that cleans dirty Markdown from visual noise for LLMs.
            </p>
            <ul className="feature-list">
              <li>
                <span className="bracket">[*]</span> <span className="feature-name">Token Savings</span> 
                <span className="feature-desc">Strips SVGs, images, and tracking links, saving up to 40% of context size</span>
              </li>
              <li>
                <span className="bracket">[*]</span> <span className="feature-name">Blazing Fast</span> 
                <span className="feature-desc">Cleaning takes less than 1 millisecond thanks to pre-compiled Regex</span>
              </li>
              <li>
                <span className="bracket">[*]</span> <span className="feature-name">Simple Integration</span> 
                <span className="feature-desc">A single POST request, and your RAG pipeline gets pristine text</span>
              </li>
              <li>
                <span className="bracket">[*]</span> <span className="feature-name">Model Agnostic</span> 
                <span className="feature-desc">Works equally well for ChatGPT, Claude, and local open-weight models</span>
              </li>
              <li>
                <span className="bracket">[*]</span> <span className="feature-name">Local-First</span> 
                <span className="feature-desc">Run via Docker or Python script on your own infrastructure</span>
              </li>
            </ul>
            <Link href="/docs" className="docs-btn">Read the documentation &rarr;</Link>
          </AnimatedSection>

          {/* Section: Savings Estimator */}
          <AnimatedSection delay={300}>
            <SavingsEstimator />
          </AnimatedSection>

          {/* Section 2: Quick Start */}
          <AnimatedSection className="quickstart-section block-card" delay={400}>
            <div className="quickstart-card block-card">
              <div className="qs-header">&gt;_ GET STARTED</div>
              <h2 className="qs-title">Brevity is yours.</h2>
              <p className="qs-subtitle">It's open source and free. No sales team, no demo request, no Trojan horse.</p>
              
              <div className="qs-code-box">
                <div className="qs-tabs">
                  {qsOptions.map((opt) => (
                    <button 
                      key={opt.id}
                      className={`qs-tab ${activeQsTab === opt.id ? 'active' : ''}`}
                      onClick={() => setActiveQsTab(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="qs-code-content">
                  <code className="qs-code">$ {qsOptions.find(o => o.id === activeQsTab)?.code}</code>
                  <button className="qs-copy-btn" onClick={handleQsCopy}>
                    {qsCopied ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <a 
                href="https://github.com/Sadiqov-Riad/Brevity" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="qs-github-btn"
                style={{ textDecoration: 'none', display: 'inline-block' }}
              >
                View on GitHub
              </a>
              
            </div>
          </AnimatedSection>

          {/* Section 3: Testimonials */}
          <AnimatedSection className="testimonial-section block-card" delay={500}>
            <div className="test-header">&#9825; LOVED BY ENTERPRISES</div>
            <h2 className="test-title">What our customers are saying</h2>
            
            <div className="test-carousel-wrap">
              <button className="carousel-nav prev-nav" onClick={prevTestimonial}>&lsaquo;</button>
              
              <div className="test-card">
                <p className="test-quote">{testimonials[currentTestimonial].quote}</p>
                <div className="test-stars">
                  {Array(testimonials[currentTestimonial].stars).fill('★').join(' ')}
                </div>
                <div className="test-author-row">
                  <div className="test-author-info">
                    <div className="test-author-name">{testimonials[currentTestimonial].author}</div>
                    <div className="test-author-role">{testimonials[currentTestimonial].role}</div>
                  </div>
                  <div className="test-avatar"></div>
                </div>
              </div>
              
              <button className="carousel-nav next-nav" onClick={nextTestimonial}>&rsaquo;</button>
            </div>
            
            <div className="test-dots">
              {testimonials.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`dot ${idx === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(idx)}
                ></span>
              ))}
            </div>
            <div className="test-hint">tap or swipe for the next satisfied customer &rarr;</div>
          </AnimatedSection>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Brevity API. All systems operational.</p>
        <div className="footer-links">
          <a href="https://github.com/Sadiqov-Riad/Brevity_MarkdownShrinker/blob/API/TERMS.md" target="_blank" rel="noopener noreferrer">Terms</a>
          <a href="https://github.com/Sadiqov-Riad/Brevity_MarkdownShrinker/blob/API/PRIVACY.md" target="_blank" rel="noopener noreferrer">Privacy</a>
          <a href="https://github.com/Sadiqov-Riad/Brevity_MarkdownShrinker/blob/API/SECURITY.md" target="_blank" rel="noopener noreferrer">Security</a>
          <a href="https://github.com/Sadiqov-Riad" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/riad-sadiqov-93a600329" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}
