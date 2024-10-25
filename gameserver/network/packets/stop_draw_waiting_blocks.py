from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class StopDrawWaitingBlocksPacket(Packet):

    def __init__(self, player, last_block):
        super().__init__()
        self.packet_id = 1011
        self.player = player
        self.last_block = last_block

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
        writer.write_int_in_bytes(self.last_block.x, 2)
        writer.write_int_in_bytes(self.last_block.y, 2)

        return writer.finalize()
