import time

from gameserver.game.vector import Vector
from gameserver.network.packet import Packet
from gameserver.network.packets.pong import PongPacket
from gameserver.network.utils.writer import Writer


class PingPacket(Packet):

    def __init__(self):
        super().__init__()
        self.packet_id = 1007

    @staticmethod
    def parse_packet(packet):
        """
        On Received Ready Packet We Send User ID and Map Size
        :param packet:
        :return:
        """
        return packet

    def handle_packet(self, packet, client):
        """On Received Ready Packet"""
        print("Ping Packet Received")
        client.last_ping_time = time.time()
        pong_packet = PongPacket()
        client.send(pong_packet)



    def finalize(self):
        writer = Writer(self.packet_id)
        return writer.finalize()
