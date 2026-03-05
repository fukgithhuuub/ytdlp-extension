# YouTube yt-dlp Audio Downloader

A lightweight set of tools to easily download the best audio version of any YouTube video you're currently watching, straight from your browser.

This project consists of two parts:
1. A local Python HTTP server (`ytdlp_server.py`) that handles download requests using `yt-dlp`.
2. A Tampermonkey userscript (`tampermonkey_script.js`) that injects a convenient "Download Audio" button directly into the YouTube player interface.

## Prerequisites

- Python 3.6 or higher
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed and accessible in your system's PATH.
- FFmpeg installed and accessible in your system's PATH (required by `yt-dlp` to extract and convert audio to MP3).
- [Tampermonkey](https://www.tampermonkey.net/) (or a similar userscript manager) installed in your browser.

## Installation

### 1. Backend Server Setup

1. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: You can also install `yt-dlp` via your system's package manager, e.g., `brew install yt-dlp` on macOS).*

2. Make sure you have FFmpeg installed:
   - **Windows:** Download from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) or use `winget install ffmpeg`.
   - **macOS:** `brew install ffmpeg`
   - **Linux:** `sudo apt install ffmpeg` (Ubuntu/Debian) or equivalent.

### 2. Userscript Setup

1. Open your browser and ensure the Tampermonkey extension is enabled.
2. Open the Tampermonkey dashboard and click on the "Add a new script" tab (the `+` icon).
3. Copy the entire contents of `tampermonkey_script.js` and paste it into the editor, replacing any default code.
4. Save the script (Ctrl+S or File > Save).

## Usage

1. **Start the local server:**
   Open a terminal, navigate to this project's directory, and run:
   ```bash
   python ytdlp_server.py
   ```
   The server will start listening on port `8080`.

2. **Download Audio:**
   - Go to YouTube and open any video.
   - You should see a new red "🎧 Download Audio" button below the video title/player.
   - Click the button. It will change state to indicate the download has started.
   - The audio will be downloaded in the highest quality available, converted to MP3, and saved in a new `downloads` folder inside the project directory where you ran the Python script.

## Notes

- The Python server must be running whenever you want to use the download button on YouTube.
- The server is configured to allow Cross-Origin Resource Sharing (CORS) from any origin so that the userscript can communicate with it from `youtube.com`. Since it runs locally on your machine, this is generally safe for this specific use case, but avoid exposing port `8080` to the public internet.
