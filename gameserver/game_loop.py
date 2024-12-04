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
        game_server.game_loop = self
        self.is_running = True
        self.thread = Thread(target=self.loop)
        self.thread.daemon = True
        self.frames_rendered_from_game_start = 0
        self.stop_render_based_on_function = None
        self.on_render_frame = None

    def start(self):
        self.is_running = True
        self.thread.start()

    def stop(self):
        self.is_running = False

    def loop(self):
        while self.is_running:
            self.frames_rendered_from_game_start += 1

            tick = time.time()
            self.dt = tick - self.lastTick
            self.lastTick = tick

            self.dt *= 1000
            self.game_server.loop(tick, self.dt)
            time.sleep(GameLoop.sleep_time)

            if not self.on_render_frame is None:
                self.on_render_frame(self.frames_rendered_from_game_start)
            if self.stop_render_based_on_function is not None and self.stop_render_based_on_function():
                self.stop()
