from gameserver.game.player import Player
from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class NamePacket(Packet):

    def __init__(self, name=""):
        super().__init__()
        self.name = name
        self.packet_id = 1001
        self.is_verified = False

    @property
    def is_valid(self):
        return 1 if self.is_verified else 0

    @staticmethod
    def parse_packet(packet):
        username = packet.reader.read_string()
        packet.name = username
        # TODO check if username is valid
        return packet

    def handle_packet(self, packet, client):
        packet.is_verified = True
        client.player = Player(packet.name)
        client.send(self)

    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_string(self.name)
        writer.write_int_in_bytes(self.is_valid, 1)
        return writer.finalize()
