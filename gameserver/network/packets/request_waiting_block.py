import time
from gameserver.game.vector import Vector
from gameserver.network.packet import Packet
from gameserver.network.packets import WaitingBlocksPacket
from gameserver.network.utils.writer import Writer


class RequestWaitingBlocks(Packet):
    PACKET_ID = 1009
    def __init__(self):
        super().__init__()
        self.packet_id = self.PACKET_ID

    def parse_packet(self):
       pass

    def handle_packet(self, client):
        """On Received Packet"""
        print("Received Request Waiting Blocks Packet")
        waiting_blocks = WaitingBlocksPacket(client.player)
        client.send(waiting_blocks)

    def finalize(self):
        writer = Writer(self.packet_id)
        return writer.finalize()
