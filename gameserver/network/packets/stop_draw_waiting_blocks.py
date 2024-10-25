from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class StopDrawWaitingBlocksPacket(Packet):
    PACKET_ID = 1011

    def __init__(self, player, last_block):
        super().__init__()
        self.packet_id = self.PACKET_ID
        self.player = player
        self.last_block = last_block

    def parse_packet(self):
        pass

    def handle_packet(self, client):
        """On Received Ready Packet"""
        print(client.player.name, "is Recived Stop Drawing WaitingBlocksPacket")

    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_int_in_bytes(self.player.player_id, 4)
        writer.write_int_in_bytes(self.last_block.x, 2)
        writer.write_int_in_bytes(self.last_block.y, 2)

        return writer.finalize()
