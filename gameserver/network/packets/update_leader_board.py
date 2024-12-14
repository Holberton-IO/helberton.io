import time

from gameserver.game.viewer import Viewer
from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class UpdateLeaderBoardPacket(Packet):
    PACKET_ID = 1013

    def __init__(self,players):
        super().__init__()
        self.players = players



    def parse_packet(self):
        pass



    def handle_packet(self, client):
        """On Received Ready Packet"""
        pass




    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_int_in_bytes(len(self.players), 2)
        for player in self.players:
            writer.write_string(player.name)
            writer.write_int_in_bytes(player.player_id, 4)
            writer.write_int_in_bytes(player.numberOfKills, 4)
            writer.write_int_in_bytes(player.color_pattern, 4)
            percentage = player.occupied_percentage
            rounded = round(percentage, 2)
            writer.write_float_in_bytes(rounded, 4)

        return writer.finalize()
