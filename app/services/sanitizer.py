import re

# Pre-compile regular expressions for maximum speed (< 1 ms)
SVG_PATTERN = re.compile(r"<svg.*?>.*?</svg>", flags=re.DOTALL | re.IGNORECASE)
IMG_PATTERN = re.compile(r"!\[.*?\]\(.*?\)")
HTML_COMMENT_PATTERN = re.compile(r"<!--.*?-->", flags=re.DOTALL)
HTML_TAG_PATTERN = re.compile(r"<[^>]*>")
UTM_PATTERN = re.compile(r"(\?|&)(utm_[^=\s]+=[^&\s]+|source=[^&\s]+|client=[^&\s]+|ref=[^&\s]+)")

def sanitize_markdown(
    content: str, 
    strip_svg: bool = True, 
    strip_img: bool = True, 
    clean_urls: bool = True
) -> str:
    """
    Cleans Markdown markup from visual noise to save LLM context tokens.
    """
    if not content:
        return ""
        
    result = content

    if strip_svg:
        result = SVG_PATTERN.sub("", result)
        
    if strip_img:
        result = IMG_PATTERN.sub("", result)
        
    if clean_urls:
        result = UTM_PATTERN.sub("", result)
        
    # Always clean up residual HTML and comments for token safety
    result = HTML_COMMENT_PATTERN.sub("", result)
    result = HTML_TAG_PATTERN.sub("", result)
    
    # Fast collapse of extra spaces and line breaks
    lines = result.splitlines()
    cleaned_lines = []
    
    for line in lines:
        if line.strip():
            cleaned_lines.append(line)
        elif cleaned_lines and cleaned_lines[-1] != "":
            cleaned_lines.append("")
                
    return "\n".join(cleaned_lines).strip()