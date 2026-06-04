import time
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from app.services.sanitizer import sanitize_markdown
from app.limiter import limiter
from app.config import settings

router = APIRouter()

# --- Data schemas (Pydantic Models) ---

class ShrinkRequest(BaseModel):
    content: str = Field(..., description="Dirty Markdown text to clean")
    strip_svg: bool = Field(True, description="Remove all <svg> tags")
    strip_img: bool = Field(True, description="Remove image markdown ![alt](url)")
    clean_urls: bool = Field(True, description="Remove UTM tracking parameters from URLs")

class ShrinkResponse(BaseModel):
    cleaned_content: str
    processing_time_ms: float
    bytes_saved: int
    saved_percent: float

# --- Routes ---

@router.post("/shrink", response_model=ShrinkResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def shrink_markdown_endpoint(request: Request, payload: ShrinkRequest):
    start_time = time.perf_counter()
    initial_size = len(payload.content)
    
    try:
        cleaned = sanitize_markdown(
            content=payload.content,
            strip_svg=payload.strip_svg,
            strip_img=payload.strip_img,
            clean_urls=payload.clean_urls
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal text processing error")
        
    end_time = time.perf_counter()
    processing_time_ms = round((end_time - start_time) * 1000, 3)
    
    bytes_saved = initial_size - len(cleaned)
    saved_percent = round((bytes_saved / initial_size * 100), 1) if initial_size > 0 else 0.0
    
    return ShrinkResponse(
        cleaned_content=cleaned,
        processing_time_ms=processing_time_ms,
        bytes_saved=max(0, bytes_saved),
        saved_percent=max(0.0, saved_percent)
    )