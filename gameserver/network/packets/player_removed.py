from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class PlayerRemovedPacket(Packet):

    def __init__(self, player):
        super().__init__()
        self.packet_id = 1010
        self.user_id = player.player_id

    @staticmethod
    def parse_packet(packet):
        return packet

    def handle_packet(self, packet, client):
        pass

    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_int_in_bytes(self.user_id, 4)
        return writer.finalize()
