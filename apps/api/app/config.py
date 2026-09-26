"""
Application settings — loaded from environment variables / .env file.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    All config comes from environment variables.
    See .ENV.EXAMPLE at the project root.
    """

    # --- App ---
    app_name: str = "SIH Jharkhand Portal API"
    debug: bool = False

    # --- Database ---
    database_url: str = "sqlite:///./sih.db"

    # --- Auth ---
    jwt_secret: str = "CHANGE-ME-IN-PRODUCTION"
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 1440  # 24 hours

    # --- Uploads ---
    upload_dir: str = "./uploads"
    max_upload_bytes: int = 20 * 1024 * 1024  # 20 MB

    # --- AI ---
    model_version: str = "mvp-v1"

    model_config = {"env_file": "../../.env", "env_file_encoding": "utf-8"}


settings = Settings()
