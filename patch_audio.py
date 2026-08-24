import sys
import os

video_py_path = "/root/MoneyPrinterTurbo2026/app/controllers/v1/video.py"
with open(video_py_path, "r") as f:
    content = f.read()

if "/preview_audio" not in content:
    new_route = """
from fastapi.responses import FileResponse
import tempfile
import os

@router.post("/preview_audio", summary="Generate a voice preview synchronously")
def create_preview_audio(request: Request, body: AudioRequest):
    from app.services import voice
    from app.utils import utils
    
    text = body.video_script or "This is a voice preview. Testing audio output quality."
    audio_file = os.path.join(tempfile.gettempdir(), f"preview_{utils.get_uuid()}.mp3")
    
    sub_maker = voice.tts(
        text=text,
        voice_name=body.voice_name,
        voice_rate=body.voice_rate,
        voice_file=audio_file,
        voice_volume=body.voice_volume,
    )
    if os.path.exists(audio_file):
        return FileResponse(audio_file, media_type="audio/mpeg")
    return utils.get_response(500, "Failed to generate audio preview")
"""
    content = content.replace(
        '@router.post("/audio", response_model=TaskResponse, summary="Generate audio only")',
        new_route + '\n@router.post("/audio", response_model=TaskResponse, summary="Generate audio only")'
    )
    with open(video_py_path, "w") as f:
        f.write(content)
    print("Patched video.py")
else:
    print("Already patched video.py")

