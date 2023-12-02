import time
from gameserver.game.vector import Vector
from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class DirectionPacket(Packet):

    def __init__(self):
        super().__init__()
        self.packet_id = 1006
        self.dir = ""
        self.position = None

    @staticmethod
    def parse_packet(packet):
        """
        On Received Ready Packet We Send User ID and Map Size
        :param packet:
        :return:
        """

        packet.dir = packet.reader.read_string()
        x = packet.reader.read_int_2()
        y = packet.reader.read_int_2()
        packet.position = Vector(x, y)
        return packet

    def handle_packet(self, packet, client):
        """On Received Ready Packet"""
        print(client.player.name, "is Changing Direction")
        print("Direction: ", self.dir)
        print("Position: ", self.position)
        client.player.client_update_pos(self.dir, self.position)


    def finalize(self):
        writer = Writer(self.packet_id)
        return writer.finalize()
