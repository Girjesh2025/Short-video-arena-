#!/usr/bin/env python3
"""
CVoice.ai Audiobook Converter
Converts PDFs, EPUBs, DOCX, DOC, TXT files into audiobooks using cvoice.ai API
"""

import os
import shutil
import logging
import hashlib
import argparse
from pathlib import Path
from typing import List, Optional, Dict, Any, Tuple
import time
import sys
import zipfile
import re
from datetime import datetime
import PyPDF2
import ebooklib
from ebooklib import epub
from pydub import AudioSegment
import requests

# Fix Windows console encoding for emoji/unicode
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# =============================================================================
# HARDCODED CONFIGURATION
# =============================================================================

# CVoice API Configuration
CVOICE_API_URL = "https://cvoice.ai/api/tts"
# Default API key provided by the user
DEFAULT_API_KEY = "cvai_eb2ed8938edaeda2b16d60198430f5246879aaedca8f07dd"
MAX_RETRIES = 3

# Processing Settings
BOOKS_FOLDER = "book_to_convert"  # Input folder
AUDIOBOOKS_FOLDER = "audiobooks"  # Output folder
CHUNK_SIZE_WORDS = 40  # Cvoice supports 50-500 chars (approx 40-70 words)
AUDIO_FORMAT = "mp3"
AUDIO_BITRATE = "128k"
MIN_DELAY_BETWEEN_CHUNKS = 1

# Optional imports with fallbacks
try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

try:
    import docx2txt
    DOC_AVAILABLE = True
except ImportError:
    DOC_AVAILABLE = False

try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False


class CVoiceAudiobookConverter:
    """Audiobook converter using CVoice API"""

    def __init__(self, api_key: str = DEFAULT_API_KEY, voice_id: str = None):
        self.api_key = api_key
        self.voice_id = voice_id
        self.setup_logging()
        self.setup_directories()

    def setup_logging(self):
        """Setup logging configuration"""
        Path("logs").mkdir(exist_ok=True)
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(f"logs/audiobook_{datetime.now().strftime('%Y%m%d')}.log"),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(__name__)

    def setup_directories(self):
        """Create necessary directories"""
        directories = [BOOKS_FOLDER, AUDIOBOOKS_FOLDER, "chunks", "cache/audio_chunks", "logs"]
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)

    def generate_chunk_via_api(self, text: str, chunk_num: int) -> Optional[str]:
        """Generate audio chunk using CVoice API"""
        try:
            # Ensure text meets the 50-500 char requirement
            if len(text) < 50:
                text = text.ljust(50, ' ')
            if len(text) > 500:
                text = text[:499]

            # Check cache first
            cache_path = self.get_cache_path(text)
            if cache_path.exists():
                output_path = Path("chunks") / f"chunk_{chunk_num:04d}.mp3"
                shutil.copy2(cache_path, output_path)
                self.logger.debug(f"Using cached audio for chunk {chunk_num}")
                return str(output_path)

            headers = {
                "Content-Type": "application/json",
                "X-API-Key": self.api_key
            }
            data = {"text": text}
            if self.voice_id:
                data["voice_id"] = self.voice_id

            # Request generation
            resp = requests.post(CVOICE_API_URL, json=data, headers=headers)
            resp.raise_for_status()
            
            resp_data = resp.json()
            mp3_url = resp_data.get("url")
            if not mp3_url:
                raise RuntimeError(f"No URL in response: {resp_data}")

            # Download the MP3
            mp3_resp = requests.get(mp3_url)
            mp3_resp.raise_for_status()

            output_path = Path("chunks") / f"chunk_{chunk_num:04d}.mp3"
            with open(output_path, "wb") as f:
                f.write(mp3_resp.content)

            # Cache the result
            shutil.copy2(output_path, cache_path)

            self.logger.debug(f"Chunk {chunk_num} generated successfully")
            return str(output_path)

        except Exception as e:
            self.logger.error(f"CVoice chunk processing failed for chunk {chunk_num}: {e}")
            return None

    def process_chunk_with_retry(self, args: Tuple[int, str]) -> bool:
        """Process chunk with retry logic and rate limiting"""
        chunk_num, text = args

        # Small delay between chunks
        if chunk_num > 1:
            time.sleep(MIN_DELAY_BETWEEN_CHUNKS)

        for attempt in range(MAX_RETRIES):
            try:
                result = self.generate_chunk_via_api(text, chunk_num)
                if result and Path(result).exists():
                    return True
                else:
                    self.logger.warning(f"Chunk {chunk_num} attempt {attempt + 1} failed")
            except Exception as e:
                self.logger.warning(f"Chunk {chunk_num} attempt {attempt + 1} error: {e}")

            if attempt < MAX_RETRIES - 1:
                sleep_time = 2 ** attempt
                self.logger.info(f"Waiting {sleep_time}s before retry...")
                time.sleep(sleep_time)

        self.logger.error(f"Chunk {chunk_num} failed after {MAX_RETRIES} attempts")
        return False

    def get_cache_path(self, text: str) -> Path:
        """Get cache path for text chunk"""
        content = f"{text}_{self.voice_id or 'default'}"
        hash_obj = hashlib.md5(content.encode())
        return Path("cache/audio_chunks") / f"{hash_obj.hexdigest()}.mp3"

    # ---------------------------------------------------------
    # Text Extraction Logic (Unchanged from original)
    # ---------------------------------------------------------
    def extract_text_from_epub(self, file_path: Path) -> str:
        methods = [self._extract_epub_ebooklib, self._extract_epub_zipfile, self._extract_epub_manual]
        for method in methods:
            try:
                text = method(file_path)
                if text and text.strip():
                    return text
            except Exception:
                continue
        raise RuntimeError("All EPUB extraction methods failed")

    def _extract_epub_ebooklib(self, file_path: Path) -> str:
        book = epub.read_epub(str(file_path))
        text_parts = []
        for item_id, linear in book.spine:
            try:
                item = book.get_item_by_id(item_id)
                if item and isinstance(item, ebooklib.ITEM_DOCUMENT):
                    content = item.get_body_content()
                    if content:
                        if isinstance(content, bytes):
                            content = content.decode('utf-8', errors='ignore')
                        clean_text = self._clean_html(str(content))
                        if clean_text.strip():
                            text_parts.append(clean_text)
            except Exception:
                continue
        return '\n\n'.join(text_parts)

    def _extract_epub_zipfile(self, file_path: Path) -> str:
        text_parts = []
        with zipfile.ZipFile(file_path, 'r') as epub_zip:
            for file_name in epub_zip.namelist():
                if file_name.lower().endswith(('.html', '.xhtml', '.htm')):
                    try:
                        content = epub_zip.read(file_name).decode('utf-8', errors='ignore')
                        clean_text = self._clean_html(content)
                        if clean_text.strip():
                            text_parts.append(clean_text)
                    except Exception:
                        continue
        return '\n\n'.join(text_parts)

    def _extract_epub_manual(self, file_path: Path) -> str:
        text_parts = []
        with zipfile.ZipFile(file_path, 'r') as epub_zip:
            for file_name in epub_zip.namelist():
                if not any(file_name.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.css', '.js']):
                    try:
                        content = epub_zip.read(file_name).decode('utf-8', errors='ignore')
                        if '<' in content and len(content.strip()) > 100:
                            clean_text = self._clean_html(content)
                            if clean_text:
                                text_parts.append(clean_text)
                    except Exception:
                        continue
        return '\n\n'.join(text_parts)

    def _clean_html(self, html_content: str) -> str:
        if not html_content: return ""
        if BS4_AVAILABLE:
            try:
                soup = BeautifulSoup(html_content, 'html.parser')
                for script in soup(["script", "style"]):
                    script.decompose()
                text = soup.get_text()
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                return ' '.join(chunk for chunk in chunks if chunk)
            except Exception:
                pass
        html_content = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
        html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
        html_content = re.sub(r'<[^>]+>', ' ', html_content)
        html_content = unescape(html_content)
        html_content = re.sub(r'\s+', ' ', html_content)
        return html_content.strip()

    def extract_text_from_file(self, file_path: Path) -> str:
        extension = file_path.suffix.lower()
        if extension == '.txt': return self._extract_txt(file_path)
        elif extension == '.pdf': return self._extract_pdf(file_path)
        elif extension == '.epub': return self.extract_text_from_epub(file_path)
        elif extension == '.docx' and DOCX_AVAILABLE: return self._extract_docx(file_path)
        elif extension == '.doc' and DOC_AVAILABLE: return self._extract_doc(file_path)
        else: raise ValueError(f"Unsupported file format: {extension}")

    def _extract_txt(self, file_path: Path) -> str:
        for encoding in ['utf-8', 'utf-16', 'latin-1', 'cp1252']:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    return self._clean_text(f.read())
            except UnicodeDecodeError:
                continue
        raise ValueError("Could not decode text file")

    def _extract_pdf(self, file_path: Path) -> str:
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                try:
                    page_text = page.extract_text()
                    if page_text.strip(): text += f"\n\n{page_text}"
                except Exception:
                    continue
        return self._clean_text(text)

    def _extract_docx(self, file_path: Path) -> str:
        doc = Document(file_path)
        return self._clean_text('\n\n'.join([p.text for p in doc.paragraphs if p.text.strip()]))

    def _extract_doc(self, file_path: Path) -> str:
        text = docx2txt.process(str(file_path))
        return self._clean_text(text) if text else ""

    def _clean_text(self, text: str) -> str:
        if not text: return ""
        text = re.sub(r'\s+', ' ', text)
        text = text.replace('\n', ' ')
        return text.strip()

    def split_into_chunks(self, text: str) -> List[str]:
        """Split text into manageable chunks of exactly 50-500 chars for CVoice API"""
        if not text.strip():
            return []

        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current_chunk = ""

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            # If a single sentence is super long (>490 chars), split it forcibly
            while len(sentence) > 490:
                part = sentence[:490]
                sentence = sentence[490:]
                chunks.append(part)
                
            # Check if adding this sentence exceeds our ~490 limit
            if len(current_chunk) + len(sentence) + 1 > 490:
                if len(current_chunk) >= 50:
                    chunks.append(current_chunk.strip())
                    current_chunk = sentence + " "
                else:
                    # Very rare: current_chunk < 50 but adding sentence makes it > 490
                    # This means the sentence itself is massive.
                    chunks.append(current_chunk.strip().ljust(50, ' '))
                    current_chunk = sentence + " "
            else:
                current_chunk += sentence + " "

        if current_chunk.strip():
            # Pad the final chunk if it's too short
            final_str = current_chunk.strip()
            if len(final_str) < 50:
                final_str = final_str.ljust(50, ' ')
            chunks.append(final_str)

        return chunks

    def combine_chunks(self, total_chunks: int, output_path: Path, results: Optional[Dict[int, bool]] = None) -> bool:
        """Combine audio chunks into final audiobook"""
        try:
            combined = AudioSegment.empty()
            successful = 0
            missing_chunks = []

            for i in range(1, total_chunks + 1):
                if results is not None and not results.get(i, False):
                    missing_chunks.append(i)
                    continue
                    
                chunk_file = Path("chunks") / f"chunk_{i:04d}.mp3"
                if chunk_file.exists():
                    try:
                        chunk_audio = AudioSegment.from_file(str(chunk_file))
                        combined += chunk_audio
                        successful += 1
                    except Exception as e:
                        self.logger.warning(f"Failed to load chunk {i}: {e}")
                        missing_chunks.append(i)
                else:
                    missing_chunks.append(i)

            if successful == 0:
                raise RuntimeError("No valid chunks found")

            combined.export(str(output_path), format=AUDIO_FORMAT, bitrate=AUDIO_BITRATE)
            print(f"[INFO] Saved audiobook: {output_path.name} ({successful}/{total_chunks} chunks)")
            return True

        except Exception as e:
            self.logger.error(f"Failed to combine chunks: {e}")
            return False

    def cleanup_chunks(self):
        """Remove temporary chunk files"""
        try:
            for chunk_file in Path("chunks").glob("chunk_*.mp3"):
                try: chunk_file.unlink()
                except: pass
        except: pass

    def convert_book(self, file_path: Path) -> bool:
        """Convert a single book to audiobook using CVoice API"""
        print(f"[INFO] Extracting text from {file_path.name}...")
        start_time = time.time()

        try:
            text = self.extract_text_from_file(file_path)
            if not text.strip():
                return False

            chunks = self.split_into_chunks(text)
            total_chunks = len(chunks)
            if total_chunks == 0:
                return False

            print(f"[INFO] Split into {total_chunks} chunks.")
            print(f"[INFO] Sending chunks to cvoice.ai API...")
            print(f"==================================================")

            results = {}
            for i, chunk_text in enumerate(chunks):
                chunk_num = i + 1
                try:
                    result = self.process_chunk_with_retry((chunk_num, chunk_text))
                    results[chunk_num] = result
                    if result:
                        print(f"[OK] Chunk {chunk_num:3d}/{total_chunks} downloaded")
                    else:
                        print(f"[FAIL] Chunk {chunk_num:3d}/{total_chunks} FAILED")
                except Exception as e:
                    results[chunk_num] = False
                    print(f"[ERROR] Chunk {chunk_num:3d}/{total_chunks} ERROR: {e}")

            successful_chunks = sum(1 for v in results.values() if v)
            print(f"==================================================")
            print(f"Successful: {successful_chunks}/{total_chunks}")
            print(f"==================================================")

            if successful_chunks == 0:
                self.cleanup_chunks()
                return False

            output_path = Path(AUDIOBOOKS_FOLDER) / f"{file_path.stem}.{AUDIO_FORMAT}"
            print(f"[INFO] Stitching audio chunks together...")
            success = self.combine_chunks(total_chunks, output_path, results)

            if success:
                duration = time.time() - start_time
                mins, secs = int(duration // 60), int(duration % 60)
                print(f"[SUCCESS] Conversion completed in {mins}m {secs}s")

            self.cleanup_chunks()
            return success

        except Exception as e:
            print(f"[ERROR] Conversion failed: {e}")
            self.cleanup_chunks()
            return False

    def run(self):
        """Main conversion process"""
        print("=" * 70)
        print("CVOICE.AI CLOUD AUDIOBOOK CONVERTER")
        print("=" * 70)
        
        books_dir = Path(BOOKS_FOLDER)
        supported_formats = ['.txt', '.pdf', '.epub', '.docx', '.doc']
        book_files = [f for f in books_dir.iterdir() if f.is_file() and f.suffix.lower() in supported_formats]

        if not book_files:
            print(f"[INFO] No supported files found in {BOOKS_FOLDER}")
            return

        for book_file in book_files:
            try:
                self.convert_book(book_file)
            except KeyboardInterrupt:
                print("\n[WARNING] Conversion interrupted by user")
                break


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CVoice.ai Audiobook Converter")
    parser.add_argument("--api-key", type=str, default=DEFAULT_API_KEY, help="CVoice API Key")
    parser.add_argument("--voice-id", type=str, default=None, help="Specific voice ID to use")
    args = parser.parse_args()

    converter = CVoiceAudiobookConverter(api_key=args.api_key, voice_id=args.voice_id)
    converter.run()
