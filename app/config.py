from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Brevity"
    # analytics_token: str = ""
    rate_limit_per_minute: int = 60
    redis_url: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
