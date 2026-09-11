import http.server
import socketserver
import urllib.request
import sys

PORT = 3000
TARGET_HOST = "http://127.0.0.1:3001"

class ReverseProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self._proxy("GET")

    def do_POST(self):
        self._proxy("POST")

    def do_PUT(self):
        self._proxy("PUT")

    def do_DELETE(self):
        self._proxy("DELETE")

    def do_HEAD(self):
        self._proxy("HEAD")

    def _proxy(self, method):
        url = f"{TARGET_HOST}{self.path}"
        headers = {k: v for k, v in self.headers.items() if k.lower() != 'host'}
        body = None
        content_len = int(self.headers.get('Content-Length', 0))
        if content_len > 0:
            body = self.rfile.read(content_len)

        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as response:
                self.send_response(response.status)
                for k, v in response.headers.items():
                    if k.lower() not in ('transfer-encoding', 'content-encoding'):
                        self.send_header(k, v)
                self.end_headers()
                self.wfile.write(response.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for k, v in e.headers.items():
                if k.lower() not in ('transfer-encoding', 'content-encoding'):
                    self.send_header(k, v)
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(502)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))

    def log_message(self, format, *args):
        pass

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), ReverseProxyHandler) as httpd:
        print(f"Port 3000 proxy running -> {TARGET_HOST}")
        httpd.serve_forever()
