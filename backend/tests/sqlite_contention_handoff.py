"""An adversarial parent requires a parked contender before resuming the holder."""

from unittest.mock import patch

from tests.sqlite_contention_harness import Peers


class ObservedPipe:
    def __init__(self, pipe, first, events):
        self.pipe = pipe
        self.first = first
        self.events = events

    def __getattr__(self, name):
        return getattr(self.pipe, name)

    def send(self, value):
        if value == "continue":
            if self.first:
                assert self.events["parked"], "Holder resumed before contender was parked"
            else:
                assert self.events["committed"], "Contender resumed before holder committed"
        return self.pipe.send(value)

    def recv(self):
        value = self.pipe.recv()
        if not self.first and value == "write_parked":
            self.events["parked"] = True
        if self.first and isinstance(value, list) and value[0] == "result":
            assert value[1][0] == 201, value
            self.events["committed"] = True
        return value


def observed_handoff(path, data):
    from tests import sqlite_contention_cases as cases

    events = {"parked": False, "committed": False}

    class ObservedPeers(Peers):
        def start(self, kind, data):
            pipe = super().start(kind, data)
            return ObservedPipe(pipe, len(self.children) == 1, events)

    # These are real peers/SQL/HTTP. Only the parent's scheduling contract is guarded.
    with patch.object(cases, "Peers", ObservedPeers):
        cases.apis(path, data)
    assert all(events.values()), events
