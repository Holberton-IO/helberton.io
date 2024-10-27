import time

from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from gameserver.game.player import Player
    from gameserver.game_server import GameServer
    from gameserver.network.socket import Socket


class GameClient:
    def __init__(self, server_socket: 'Socket', game_server: 'GameServer' , is_mock=False):
        self.server_socket: Socket = server_socket
        self.game_server: GameServer = game_server
        self.player: Optional[Player] = None
        self.last_ping_time: float = time.time()
        self.is_mock: bool = is_mock

    def send(self, packet):
        if self.is_mock:
            return
        self.server_socket.send(bytes(packet.finalize()))
