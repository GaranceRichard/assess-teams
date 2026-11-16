"""Run preparation-host pip inside the target interpreter with network denied."""

import runpy
import sys

attempts = []
NETWORK_EVENTS = {
    "socket.connect",
    "socket.getaddrinfo",
    "socket.gethostbyname",
    "socket.gethostbyaddr",
    "socket.getnameinfo",
    "socket.sendto",
    "socket.sendmsg",
    "urllib.Request",
}


def deny_network(event, arguments):
    if event in NETWORK_EVENTS:
        attempts.append(event)
        raise RuntimeError("Offline qualification forbids network: " + event)


sys.addaudithook(deny_network)
if sys.argv[1:] == ["--test-network-guard"]:
    import urllib.request

    try:
        urllib.request.urlopen("https://127.0.0.1:9/implicit-download")
    except RuntimeError:
        print("PASS implicit download refused before connection", attempts)
    else:
        raise RuntimeError("Network guard failed")
else:
    sys.path.insert(0, sys.argv.pop(1))
    sys.argv[0] = "pip"
    try:
        runpy.run_module("pip", run_name="__main__")
    finally:
        print("NETWORK_ATTEMPTS=" + str(len(attempts)))
        if attempts:
            raise RuntimeError("Implicit network access refuses qualification")
