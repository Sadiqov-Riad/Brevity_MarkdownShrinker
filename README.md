# Brevity API

**Cleaning Markdown files from visual noise in 10 milliseconds to save LLM tokens.**

**Brevity** is a fast microservice built with FastAPI. It takes "dirty" Markdown (copied from documentation, Notion, or GitHub repositories) and removes everything that carries no semantic value for language models. The output is compressed, clean text ready to be sent into the context window of ChatGPT, Claude, or a local Gemma model.

### 🌟 Why is this needed?
- **Save money**: You pay per token. Removing SVGs, long URLs, and images saves 30-50% of the payload size.
- **Improve focus**: Without visual noise, LLMs provide more accurate answers and hallucinate less.
- **Bypass limits**: Allows fitting more useful documentation into the context window.

---

## 🚀 Quick Setup

### 1. Install Dependencies
Ensure you have Python 3.9+ installed.
```bash
# Clone the repository (if applicable)
# git clone <url> && cd Brevity

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # For Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Run the Server
The server is launched using the FastAPI CLI:
```bash
fastapi dev app/main.py
```
The server will be available at: `http://127.0.0.1:8000`

---

## 📖 How to Use

The easiest way to test the API is to open the built-in **Swagger UI** documentation:
👉 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Example Request (cURL)
```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/v1/shrink' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "content": "Hello! ![logo](image.png)\n# Title\n\nLink: https://site.com/?utm_source=test",
    "strip_svg": true,
    "strip_img": true,
    "clean_urls": true
}'
```

### Example Response
```json
{
  "cleaned_content": "Hello! \n# Title\n\nLink: https://site.com/",
  "processing_time_ms": 0.053,
  "bytes_saved": 34,
  "saved_percent": 40.5
}
```

---

## 🛠 Tech Stack
- **Framework**: FastAPI + Pydantic
- **Regex**: Pre-compiled regular expressions for < 1ms speed
- **Deployment**: Ready-to-use `Dockerfile` (python:3.11-slim)
