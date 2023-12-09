import time
from gameserver.game.vector import Vector
from gameserver.network.packet import Packet
from gameserver.network.packets import WaitingBlocksPacket
from gameserver.network.utils.writer import Writer


class RequestWaitingBlocks(Packet):

    def __init__(self):
        super().__init__()
        self.packet_id = 1009

    @staticmethod
    def parse_packet(packet):
        """
        On Received Ready Packet We Send User ID and Map Size
        :param packet:
        :return:
        """
        return packet

    def handle_packet(self, packet, client):
        """On Received Packet"""
        print("Received Request Waiting Blocks Packet")
        waiting_blocks = WaitingBlocksPacket(client.player)
        client.send(waiting_blocks)

    def finalize(self):
        writer = Writer(self.packet_id)
        return writer.finalize()
