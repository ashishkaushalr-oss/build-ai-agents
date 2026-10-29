"""Tiny local server for the icon concept board.

Serves the course folder over HTTP (so the board can load the SVGs) and accepts
POST /save?name=<file>.png with a PNG body, which it writes into assets/concepts/.
The browser does the rendering; this only stores what it sends. Local use only.
Run: python tools/icon_server.py [port]
"""
import http.server, os, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVE_DIR = os.path.join(ROOT, 'assets', 'concepts')


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        u = urllib.parse.urlparse(self.path)
        name = os.path.basename(urllib.parse.parse_qs(u.query).get('name', [''])[0])
        if u.path != '/save' or not name.endswith('.png') or len(name) < 5:
            self.send_error(400, 'expected /save?name=<file>.png')
            return
        data = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        if not data.startswith(b'\x89PNG'):
            self.send_error(400, 'not a PNG')
            return
        os.makedirs(SAVE_DIR, exist_ok=True)
        with open(os.path.join(SAVE_DIR, name), 'wb') as f:
            f.write(data)
        body = ('saved %s (%d bytes)' % (name, len(data))).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8790
    print('icon board at http://127.0.0.1:%d/assets/concepts/board.html' % port, flush=True)
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
