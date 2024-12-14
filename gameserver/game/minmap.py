from gameserver.game.rect import Rectangle
from gameserver.game.vector import Vector
from gameserver.game.viewer import Viewer
from gameserver.network.packets import FillAreaPacket


class MinMap:
    def __init__(self,game_server):
        self.last_update = 0
        self.update_interval = 15
        self.game_server = game_server

    def loop(self,dt , tick):
        if tick - self.last_update > self.update_interval:
            self.last_update = tick
            self.update()

    def update(self):
        self.send_minimap()


    def send_minimap(self):
        players = self.game_server.players
        packets = []
        # for player in players:
            # packet = player.generate_state_packet()
            # packets.append(packet)

        map_size = self.game_server.map.map_size
        min_world = Vector(0,0).add_scalar(-self.game_server.updates_viewport_rect_size)
        max_world= Vector(map_size ,map_size).add_scalar(self.game_server.updates_viewport_rect_size)
        rect = Rectangle(min_world,max_world)
        for cmp_block in self.game_server.map.get_compressed_blocks_in(rect):
            area_packet = FillAreaPacket(cmp_block[0],cmp_block[1])
            packets.append(area_packet)


        for player in players:
            for packet in packets:
                player.client.send(packet)


