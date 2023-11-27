from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class PlayerStatePacket(Packet):

    def __init__(self, player):
        super().__init__()
        self.packet_id = 1004
        self.user_id = player.player_id
        self.player_name = player.name
        self.player_x = player.position.x
        self.player_y = player.position.y
        self.player_direction = player.direction

        ## COLORS
        self.color_brighter = player.color_brighter
        self.color_darker = player.color_darker
        self.color_slightlyBrighter = player.color_slightlyBrighter
        self.color_pattern = player.color_pattern
        self.color_patternEdge = player.color_patternEdge

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
        print(client.player.name, "is Recived Player State Packet")

    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_int_in_bytes(self.user_id, 4)
        writer.write_string(self.player_name)

        # Send Player Position
        writer.write_int_in_bytes(self.player_x, 2)
        writer.write_int_in_bytes(self.player_y, 2)
        writer.write_string(self.player_direction)

        # Send Player Colors
        writer.write_int_in_bytes(self.color_brighter, 4)
        writer.write_int_in_bytes(self.color_darker, 4)
        writer.write_int_in_bytes(self.color_slightlyBrighter, 4)
        writer.write_int_in_bytes(self.color_pattern, 4)
        writer.write_int_in_bytes(self.color_patternEdge, 4)

        return writer.finalize()
