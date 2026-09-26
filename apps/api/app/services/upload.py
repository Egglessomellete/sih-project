"""
File upload service — saves uploaded files to uploads/ directory.
Validates file extension, size limit, and returns relative storage path.
"""

import os
import uuid
from fastapi import HTTPException, UploadFile, status

from app.config import settings

ALLOWED_EXTENSIONS = {
    # Images
    "jpg", "jpeg", "png", "webp",
    # Documents
    "pdf", "doc", "docx", "txt",
    # Video / Audio
    "mp4", "mov", "avi", "mp3", "wav",
}


def save_upload_file(file: UploadFile) -> str:
    """Save an UploadFile to disk and return relative file path."""
    filename = file.filename or "file"
    ext = filename.split(".")[-1].lower() if "." in filename else ""

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '.{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # Ensure uploads directory exists
    os.makedirs(settings.upload_dir, exist_ok=True)

    # Unique file name to prevent collision
    unique_name = f"{uuid.uuid4().hex[:12]}_{filename}"
    file_path = os.path.join(settings.upload_dir, unique_name)

    # Read bytes and verify size limit
    content = file.file.read()
    if len(content) > settings.max_upload_bytes:
        max_mb = settings.max_upload_bytes // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size limit of {max_mb}MB.",
        )

    with open(file_path, "wb") as f:
        f.write(content)

    return file_path
