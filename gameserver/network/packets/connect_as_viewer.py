import time

from gameserver.game.viewer import Viewer
from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer


class ViewerConnectPacket(Packet):
    PACKET_ID = 1012

    def __init__(self):
        super().__init__()
        self.viewer = None
        self.map_size = 0



    def parse_packet(self):
        pass



    def handle_packet(self, client):
        """On Received Ready Packet"""
        print("Viewer is ready")
        game_server = client.game_server
        client.player = Viewer(game_server, client, -1)
        client.player.id = game_server.generate_random_id()

        v = client.player
        v.position = client.game_server.get_spawn_point_center()
        self.viewer = v
        self.map_size = game_server.map.map_size

        game_server.add_new_player(client.player)
        client.send(self)
        v.send_player_viewport()

        # p = Player(None,None,"Man",999)
        # p.direction = "right"
        # p.position = Vector(20,20)
        # p.choose_random_color()
        # from gameserver.network.packets import PlayerStatePacket
        #
        # ps = PlayerStatePacket(p)
        # client.send(ps)




    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_int_in_bytes(self.map_size, 2)
        writer.write_int_in_bytes(self.viewer.id, 4)
        writer.write_int_in_bytes(self.viewer.position.x, 2)
        writer.write_int_in_bytes(self.viewer.position.y, 2)

        return writer.finalize()
