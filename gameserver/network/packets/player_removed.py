from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class PlayerRemovedPacket(Packet):

    PACKET_ID = 1010

    def __init__(self, player):
        super().__init__()
        self.packet_id = self.PACKET_ID
        self.user_id = player.player_id

    def parse_packet(self):
       pass

    def handle_packet(self, client):
        pass

    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_int_in_bytes(self.user_id, 4)
        return writer.finalize()
