from datetime import time

import time
from threading import Thread


class GameLoop:
    __instance = None
    sleep_time = 50 / 1000

    def __new__(cls, *args, **kwargs):
        if GameLoop.__instance is None:
            GameLoop.__instance = object.__new__(cls)

        return GameLoop.__instance

    def __init__(self, game_server):
        self.lastTick = time.time()
        self.dt = time.time()
        self.game_server = game_server
        self.is_running = True
        self.thread = Thread(target=self.loop)
        self.start()

    def start(self):
        self.is_running = True
        self.thread.start()

    def stop(self):
        self.is_running = False

    def loop(self):
        while self.is_running:
            tick = time.time()
            self.dt = tick - self.lastTick
            self.lastTick = tick
            self.game_server.loop(tick, self.dt)
            time.sleep(GameLoop.sleep_time)
