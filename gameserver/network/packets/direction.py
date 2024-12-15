import time
from gameserver.game.vector import Vector
from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class DirectionPacket(Packet):
    PACKET_ID = 1006

    def __init__(self):
        super().__init__()
        self.packet_id = self.PACKET_ID
        self.dir = ""
        self.position = None



    def parse_packet(self):
        reader = self.reader
        self.dir = reader.read_string()
        x = self.reader.read_int_2()
        y = self.reader.read_int_2()
        self.position = Vector(x, y)



    def handle_packet(self, client):
        """On Received Ready Packet"""
        # print(client.player.name, "is Changing Direction")
        # print("Direction: ", self.dir)
        # print("Position: ", self.position)
        client.player.client_update_pos(self.dir, self.position)


    def finalize(self):
        writer = Writer(self.packet_id)
        return writer.finalize()
