class GameClient:
    def __init__(self, server_socket, game_server):
        self.server_socket = server_socket
        self.game_server = game_server
        self.player = None

    def send(self, packet):
        self.server_socket.send(bytes(packet.finalize()))

