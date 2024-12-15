from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class WaitingBlocksPacket(Packet):
    PACKET_ID = 1005
    def __init__(self, player):
        super().__init__()
        self.packet_id = self.PACKET_ID
        self.player = player

    def parse_packet(self):
       pass

    def handle_packet(self, client):
        """On Received Ready Packet"""
        # print(client.player.name, "is Recived WaitingBlocksPacket")
        pass
    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_int_in_bytes(self.player.player_id, 4)
        blocks_size = len(self.player.capture_blocks)
        writer.write_int_in_bytes(blocks_size, 2)
        for block in self.player.capture_blocks:
            writer.write_int_in_bytes(block.x, 2)
            writer.write_int_in_bytes(block.y, 2)


        return writer.finalize()
