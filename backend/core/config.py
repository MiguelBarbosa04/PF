from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:superuser123@localhost:5432/pf"

    class Config:
        env_file = ".env"

settings = Settings()
