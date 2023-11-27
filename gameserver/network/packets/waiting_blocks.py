from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class WaitingBlocksPacket(Packet):

    def __init__(self, player):
        super().__init__()
        self.packet_id = 1005
        self.player = player
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
        print(client.player.name, "is Recived WaitingBlocksPacket")

    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_int_in_bytes(self.player.player_id, 4)
        blocks_size = len(self.player.capture_blocks)
        writer.write_int_in_bytes(blocks_size, 2)
        for block in self.player.capture_blocks:
            writer.write_int_in_bytes(block.x, 2)
            writer.write_int_in_bytes(block.y, 2)


        return writer.finalize()
