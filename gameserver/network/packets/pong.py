import time

from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class PongPacket(Packet):

    def __init__(self):
        super().__init__()
        self.packet_id = 1008

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
        pass



    def finalize(self):
        writer = Writer(self.packet_id)
        return writer.finalize()
