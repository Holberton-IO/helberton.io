from typing import TYPE_CHECKING

from gameserver.game.objects.h_object import HObject

if TYPE_CHECKING:
    from gameserver.client import GameClient
    from gameserver.game_server import GameServer


class Viewer(HObject):

    def __init__(self, game: 'GameServer', client: 'GameClient', viewer_id):
        super().__init__(game, client, viewer_id, "Viewer")
        self.frames_rendered_from_game_start = 0


    def loop(self, tick, dt, game_server):
        if self.frames_rendered_from_game_start >= 200:
            self.frames_rendered_from_game_start = 0
        self.frames_rendered_from_game_start += tick

    def on_removed(self):
        self.game.players.remove(self)