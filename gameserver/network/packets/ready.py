from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class ReadyPacket(Packet):

    def __init__(self, user_id=0, map_size=0):
        super().__init__()
        self.packet_id = 1002
        self.user_id = user_id
        self.map_size = map_size
        self.player_name = ""

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
        print(client.player.name, "is ready")
        self.user_id = client.game_server.generate_random_id()
        self.map_size = client.game_server.map_size
        self.player_name = client.player.name
        client.send(self)

    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_int_in_bytes(self.user_id, 4)
        writer.write_int_in_bytes(self.map_size, 2)
        writer.write_string(self.player_name)
        return writer.finalize()
