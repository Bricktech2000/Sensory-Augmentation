# https://stackoverflow.com/questions/19705785/python-3-simple-https-server

import http.server
import ssl

server_address = ('0.0.0.0', 4443)
httpd = http.server.HTTPServer(
    server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(
    httpd.socket, server_side=True, certfile='localhost.pem', ssl_version=ssl.PROTOCOL_TLS)
httpd.serve_forever()
