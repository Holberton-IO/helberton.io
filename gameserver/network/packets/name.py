from gameserver.game.player import Player
from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class NamePacket(Packet):
    PACKET_ID = 1001

    def __init__(self, name=""):
        super().__init__()
        self.name = name
        self.packet_id = self.PACKET_ID
        self.is_verified = False

        self.player = None

    @property
    def is_valid(self):
        return 1 if self.is_verified else 0

    def parse_packet(self):
        reader = self.reader
        username = reader.read_string()
        self.name = username
        # TODO check if username is valid

    def handle_packet(self, client):
        self.is_verified = True # TODO check if username is valid
        client.player = Player(client.game_server, client, self.name)
        client.player.player_id = client.game_server.generate_random_id()
        self.player = client.player

        client.send(self)

    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_string(self.name)
        writer.write_int_in_bytes(self.player.player_id, 4)
        writer.write_int_in_bytes(self.is_valid, 1)
        return writer.finalize()
