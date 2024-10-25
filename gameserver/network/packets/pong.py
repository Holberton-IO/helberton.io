from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class PongPacket(Packet):
    PACKET_ID = 1008

    def __init__(self):
        super().__init__()
        self.packet_id = self.PACKET_ID

    def parse_packet(self):
        pass

    def handle_packet(self, client):
        """On Received Ready Packet"""
        pass

    def finalize(self):
        writer = Writer(self.packet_id)
        return writer.finalize()
