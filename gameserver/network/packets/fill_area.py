from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer
from gameserver.game.player import Player

class FillAreaPacket(Packet):
    def __init__(self, rect, player):
        super().__init__()
        self.packet_id = 1003
        self.area = rect
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
        """On Received Ready fill area"""
        return

    def finalize(self):
        writer = Writer(self.packet_id)
        width = self.area.max.x - self.area.min.x
        height = self.area.max.y - self.area.min.y
        writer.write_int_in_bytes(self.area.min.x, 2)
        writer.write_int_in_bytes(self.area.min.y, 2)
        writer.write_int_in_bytes(width, 2)
        writer.write_int_in_bytes(height, 2)

        # Send Player Colors
        if type(self.player) is Player:
            writer.write_int_in_bytes(self.player.player_id, 4)
            writer.write_int_in_bytes(self.player.color_brighter, 4)
            writer.write_int_in_bytes(self.player.color_darker, 4)
            writer.write_int_in_bytes(self.player.color_slightlyBrighter, 4)
            writer.write_int_in_bytes(self.player.color_pattern, 4)
            writer.write_int_in_bytes(self.player.color_patternEdge, 4)
        else:
            data = self.player
            empty = 0
            writer.write_int_in_bytes(data, 4)
            writer.write_int_in_bytes(empty, 4)
            writer.write_int_in_bytes(empty, 4)
            writer.write_int_in_bytes(empty, 4)
            writer.write_int_in_bytes(empty, 4)
            writer.write_int_in_bytes(empty, 4)


        return writer.finalize()
