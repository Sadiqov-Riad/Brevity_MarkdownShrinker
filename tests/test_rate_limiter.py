from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_rate_limiting():
    limit = settings.rate_limit_per_minute
    
    # Send requests up to the limit
    for _ in range(limit):
        response = client.post(
            "/v1/shrink",
            json={"content": "Test markdown", "strip_svg": True, "strip_img": True, "clean_urls": True}
        )
        assert response.status_code == 200
        
    # The (limit + 1)th request should be rejected with 429
    response = client.post(
        "/v1/shrink",
        json={"content": "Test markdown", "strip_svg": True, "strip_img": True, "clean_urls": True}
    )
    assert response.status_code == 429
    assert "Rate limit exceeded" in response.json()["error"]
