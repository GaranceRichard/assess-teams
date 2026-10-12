import socketserver
import threading
from contextlib import contextmanager


class SMTPHandler(socketserver.StreamRequestHandler):
    def handle(self):
        if not self.server.greeting:
            self.server.stop.wait(0.3)
            return
        self.wfile.write(b"220 local SMTP\r\n")
        while command := self.rfile.readline():
            verb = command.split(b" ")[0].strip().upper()
            if verb == b"QUIT":
                self.wfile.write(b"221 closing\r\n")
                return
            if verb == b"RCPT":
                self.wfile.write(f"{self.server.recipient_code} recipient\r\n".encode())
            elif verb == b"DATA":
                self.wfile.write(b"354 data\r\n")
                lines = []
                while line := self.rfile.readline():
                    if line == b".\r\n":
                        break
                    lines.append(line)
                self.server.messages.append(b"".join(lines))
                self.wfile.write(b"250 accepted\r\n")
            else:
                self.wfile.write(b"250 OK\r\n")


@contextmanager
def smtp_server(code=250, greeting=True):
    with socketserver.ThreadingTCPServer(("127.0.0.1", 0), SMTPHandler) as server:
        server.daemon_threads = True
        server.recipient_code = code
        server.greeting = greeting
        server.messages = []
        server.stop = threading.Event()
        thread = threading.Thread(target=server.serve_forever, kwargs={"poll_interval": 0.01})
        thread.start()
        try:
            yield server
        finally:
            server.stop.set()
            server.shutdown()
            thread.join(timeout=5)
