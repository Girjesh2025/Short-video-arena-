import gradio as gr
import subprocess
import os
import shutil
import threading
import time

BOOKS_DIR = "/root/Qwen3-Audiobook-Converter/book_to_convert"
AUDIOBOOKS_DIR = "/root/Qwen3-Audiobook-Converter/audiobooks"
CONVERTER_SCRIPT = "/root/Qwen3-Audiobook-Converter/audiobook_converter.py"

# Ensure directories exist
os.makedirs(BOOKS_DIR, exist_ok=True)
os.makedirs(AUDIOBOOKS_DIR, exist_ok=True)

custom_css = """
body {
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    color: white;
    font-family: 'Inter', sans-serif;
}
.gradio-container {
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    padding: 2rem !important;
}
h1, h2, h3 {
    background: linear-gradient(to right, #ec4899, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800 !important;
}
button.primary {
    background: linear-gradient(to right, #ec4899, #8b5cf6) !important;
    border: none !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4) !important;
}
button.primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(236, 72, 153, 0.6) !important;
}
.file-upload {
    border: 2px dashed rgba(236, 72, 153, 0.5) !important;
    border-radius: 15px !important;
    background: rgba(0,0,0,0.2) !important;
}
"""

def process_book(file_obj, api_key, voice_id):
    if file_obj is None:
        yield "❌ Please upload a file.", None
        return

    # Clear old files in books dir
    for f in os.listdir(BOOKS_DIR):
        if f != "sample.txt":
            os.remove(os.path.join(BOOKS_DIR, f))

    # Save new file
    filename = os.path.basename(file_obj.name)
    target_path = os.path.join(BOOKS_DIR, filename)
    shutil.copy(file_obj.name, target_path)

    yield f"🚀 Uploaded {filename}. Starting CLOUD conversion...\n", None

    # Prepare command
    cmd = ["python", "-u", CONVERTER_SCRIPT]
    if api_key.strip():
        cmd.extend(["--api-key", api_key.strip()])
    if voice_id.strip():
        cmd.extend(["--voice-id", voice_id.strip()])

    # Run subprocess
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        cwd="/root/Qwen3-Audiobook-Converter",
        env=dict(os.environ, PYTHONUNBUFFERED="1")
    )

    log_output = ""
    for line in iter(process.stdout.readline, ''):
        log_output += line
        # Only yield every few lines or on important keywords to avoid overwhelming Gradio
        if "INFO" in line or "SUCCESS" in line or "ERROR" in line or "PROCESSING" in line or "Chunk" in line or "==" in line:
            yield log_output, None
            time.sleep(0.05)

    process.wait()
    
    # Check for output file
    base_name = os.path.splitext(filename)[0]
    expected_output = os.path.join(AUDIOBOOKS_DIR, f"{base_name}.wav") # assuming wav
    if not os.path.exists(expected_output):
        expected_output = os.path.join(AUDIOBOOKS_DIR, f"{base_name}.mp3")
        
    if os.path.exists(expected_output):
        yield log_output + f"\n\n✅ SUCCESS! Audiobook generated: {os.path.basename(expected_output)}", expected_output
    else:
        # Check if any new audio file was generated recently
        audio_files = [os.path.join(AUDIOBOOKS_DIR, f) for f in os.listdir(AUDIOBOOKS_DIR) if f.endswith(('.wav', '.mp3'))]
        if audio_files:
            latest_file = max(audio_files, key=os.path.getctime)
            yield log_output + f"\n\n✅ SUCCESS! Audiobook generated: {os.path.basename(latest_file)}", latest_file
        else:
            yield log_output + "\n\n❌ Failed to generate audiobook.", None


with gr.Blocks(css=custom_css, theme=gr.themes.Monochrome()) as app:
    gr.HTML("<center><h1>🎙️ Cloud Audiobook Creator</h1><p style='color:#94a3b8;'>Powered by cvoice.ai Cloud API (Lightning Fast & No Server Crashes)</p></center>")
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### 1. Upload Book")
            book_file = gr.File(label="Upload Book (.txt, .pdf, .epub)", elem_classes="file-upload")
            
            gr.Markdown("### 2. API Settings")
            api_key = gr.Textbox(label="cvoice.ai API Key", value="cvai_eb2ed8938edaeda2b16d60198430f5246879aaedca8f07dd", type="password")
            voice_id = gr.Textbox(label="Voice ID (Optional - Leave blank for default)", placeholder="e.g. 00a77add-48d0-4088-b16b-695e5bd0fb73")
            
            convert_btn = gr.Button("✨ Generate Audiobook (CLOUD)", elem_classes="primary", size="lg")
            
        with gr.Column(scale=1):
            gr.Markdown("### Console Output")
            log_box = gr.Textbox(label="Logs", lines=15, max_lines=20, show_label=False)
            
            gr.Markdown("### Result")
            output_audio = gr.Audio(label="Your Audiobook", interactive=False)

    convert_btn.click(
        fn=process_book,
        inputs=[book_file, api_key, voice_id],
        outputs=[log_box, output_audio]
    )

if __name__ == "__main__":
    app.launch(server_name="0.0.0.0", server_port=7861)
