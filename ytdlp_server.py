import os
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.parse
import json

class YTDLPServer(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        try:
            data = json.loads(post_data.decode('utf-8'))
            video_url = data.get('url')

            if not video_url:
                self.send_response(400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b"Missing 'url' parameter")
                return

            print(f"Received request to download: {video_url}")

            # Start download in a separate process so we don't block the server response
            # Download best audio and save as mp3 in a 'downloads' folder
            download_dir = os.path.join(os.getcwd(), 'downloads')
            os.makedirs(download_dir, exist_ok=True)

            # This is using yt-dlp to download the best audio available
            command = [
                'yt-dlp',
                '-f', 'bestaudio',
                '--extract-audio',
                '--audio-format', 'mp3',
                '--audio-quality', '0',
                '-o', os.path.join(download_dir, '%(title)s.%(ext)s'),
                video_url
            ]

            # Run asynchronously
            subprocess.Popen(command)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'status': 'success', 'message': f'Download started for {video_url}'}
            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))

def run(server_class=HTTPServer, handler_class=YTDLPServer, port=8080):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting httpd on port {port}...')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print('Stopping httpd...\n')

if __name__ == '__main__':
    run()
