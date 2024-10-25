import time

from gameserver.game.vector import Vector
from gameserver.network.packet import Packet
from gameserver.network.packets.pong import PongPacket
from gameserver.network.utils.writer import Writer


class PingPacket(Packet):
    PACKET_ID = 1007

    def __init__(self):
        super().__init__()
        self.packet_id = self.PACKET_ID

    def parse_packet(self):
        pass

    def handle_packet(self, client):
        """On Received Ready Packet"""
        print("Ping Packet Received")
        client.last_ping_time = time.time()
        pong_packet = PongPacket()
        client.send(pong_packet)

    def finalize(self):
        writer = Writer(self.packet_id)
        return writer.finalize()
