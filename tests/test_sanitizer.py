from app.services.sanitizer import sanitize_markdown

def test_sanitize_markdown():
    dirty_md = "![alt](image.png)\n# Title"
    clean_md = sanitize_markdown(dirty_md)
    # TODO: Add assertions
    # assert clean_md == "# Title"
