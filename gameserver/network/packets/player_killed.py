import time

from gameserver.game.viewer import Viewer
from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class KilledPlayerPacket(Packet):
    PACKET_ID = 1014

    def __init__(self, killed, killer):
        super().__init__()
        self.killer = killer
        self.killed = killed

    def parse_packet(self):
        pass

    def handle_packet(self, client):
        pass


    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_int_in_bytes(self.killer.player_id, 4)
        writer.write_string(self.killer.name)
        writer.write_int_in_bytes(self.killed.player_id, 4)
        writer.write_string(self.killed.name)

        return writer.finalize()
