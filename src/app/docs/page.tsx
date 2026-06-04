"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Docs() {
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const onHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Brevity<span className="blink">_</span></h1>
          </Link>
          <span className="badge">Docs</span>
        </div>
        <nav className="nav-links">
          <Link href="/#quick-start">Quick Start</Link>
          <Link href="/docs" style={{ color: 'var(--fg-color)' }}>Docs</Link>
          <Link href="/#reviews">Reviews</Link>
          <a href="https://github.com/Sadiqov-Riad/Brevity" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </header>

      <div className="docs-layout">
        <aside className="docs-sidebar">
          <nav className="docs-nav">
            <a href="#overview" className={activeHash === '#overview' ? 'active' : ''}>Overview</a>
            <a href="#quick-setup" className={activeHash === '#quick-setup' ? 'active' : ''}>Quick Setup</a>
            <a href="#api-reference" className={activeHash === '#api-reference' ? 'active' : ''}>API Reference</a>
            <a href="#integrations" className={activeHash === '#integrations' ? 'active' : ''}>Integrations</a>
          </nav>
        </aside>

        <main className="docs-content block-card">
          <section id="overview" className="docs-section">
            <h2 className="docs-h2">1. Overview</h2>
            <p className="docs-p">
              <strong>Brevity</strong> is a fast microservice built with FastAPI. It takes "dirty" Markdown (copied from documentation, Notion, or GitHub repositories) and removes everything that carries no semantic value for language models.
            </p>
            <p className="docs-p">
              The output is compressed, clean text ready to be sent into the context window of ChatGPT, Claude, or a local Gemma model.
            </p>
            <h3 className="docs-h3">Why is this needed?</h3>
            <ul className="docs-list">
              <li><strong>Save money:</strong> You pay per token. Removing SVGs, long URLs, and images saves 30-50% of the payload size.</li>
              <li><strong>Improve focus:</strong> Without visual noise, LLMs provide more accurate answers and hallucinate less.</li>
              <li><strong>Bypass limits:</strong> Allows fitting more useful documentation into the context window.</li>
            </ul>
          </section>

          <hr className="docs-hr" />

          <section id="quick-setup" className="docs-section">
            <h2 className="docs-h2">2. Quick Setup</h2>
            <p className="docs-p">Ensure you have Python 3.9+ installed.</p>
            
            <h3 className="docs-h3">Install Dependencies</h3>
            <div className="docs-code-block">
              <pre><code>{`# Clone the repository
git clone https://github.com/Sadiqov-Riad/Brevity.git
cd Brevity

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # For Windows: .venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt`}</code></pre>
            </div>

            <h3 className="docs-h3">Run the Server</h3>
            <p className="docs-p">The server is launched using the FastAPI CLI:</p>
            <div className="docs-code-block">
              <pre><code>{`fastapi dev app/main.py`}</code></pre>
            </div>
            <p className="docs-p">The server will be available at: <code>http://127.0.0.1:8000</code></p>
          </section>

          <hr className="docs-hr" />

          <section id="api-reference" className="docs-section">
            <h2 className="docs-h2">3. API Reference</h2>
            <p className="docs-p">
              The easiest way to test the API is to open the built-in <strong>Swagger UI</strong> documentation at <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer" style={{color: 'var(--fg-color)'}}>http://127.0.0.1:8000/docs</a>.
            </p>

            <h3 className="docs-h3">Example Request (cURL)</h3>
            <div className="docs-code-block">
              <pre><code>{`curl -X 'POST' \\
  'http://127.0.0.1:8000/v1/shrink' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "content": "Hello! ![logo](image.png)\\n# Title\\n\\nLink: https://site.com/?utm_source=test",
    "strip_svg": true,
    "strip_img": true,
    "clean_urls": true
}'`}</code></pre>
            </div>

            <h3 className="docs-h3">Example Response</h3>
            <div className="docs-code-block">
              <pre><code>{`{
  "cleaned_content": "Hello! \\n# Title\\n\\nLink: https://site.com/",
  "processing_time_ms": 0.053,
  "bytes_saved": 34,
  "saved_percent": 40.5
}`}</code></pre>
            </div>
          </section>
          
          <hr className="docs-hr" />
          
          <section id="integrations" className="docs-section">
            <h2 className="docs-h2">4. Integrations</h2>
            <p className="docs-p">
              Brevity acts as an independent proxy/middleware. In your existing RAG (Retrieval-Augmented Generation) pipeline, simply intercept the text extraction phase and send a POST request to Brevity before feeding the text to your embedding model or LLM context.
            </p>
            <p className="docs-p">
              Compatible seamlessly with:
            </p>
            <ul className="docs-list">
              <li><strong>LangChain:</strong> Create a custom <code>DocumentTransformer</code> that calls the Brevity API.</li>
              <li><strong>LlamaIndex:</strong> Implement a <code>NodePostprocessor</code> to clean nodes on the fly.</li>
              <li><strong>Raw API Calls:</strong> Preprocess the prompt string before passing it to OpenAI, Anthropic, or local LLMs.</li>
            </ul>
          </section>

        </main>
      </div>
      
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
