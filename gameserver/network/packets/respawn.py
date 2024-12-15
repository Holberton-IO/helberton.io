import time

from gameserver.game.vector import Vector
from gameserver.network.packet import Packet
from gameserver.network.packets import ReadyPacket
from gameserver.network.packets.pong import PongPacket
from gameserver.network.utils.writer import Writer


class RespawnPacket(Packet):
    PACKET_ID = 1015

    def __init__(self):
        super().__init__()
        self.packet_id = self.PACKET_ID
        self.user_id = 0
        self.map_size = 0
        self.player_name = ""
        self.player_x = 0
        self.player_y = 0
        self.player_direction = ''

        ## COLORS
        self.color_brighter = 0
        self.color_darker = 0
        self.color_slightlyBrighter = 0
        self.color_pattern = 0
        self.color_patternEdge = 0

    def parse_packet(self):
        pass

    def handle_packet(self, client):
        print(f"Player {client.player.name} respawned")
        self.map_size = client.game_server.map.map_size
        self.player_name = client.player.name
        self.user_id = client.player.player_id
        position, direction = client.game_server.get_spawn_point()
        client.player.position = position
        print(f"Player {client.player.name} respawned at {position}, {direction}")
        client.player.start_position = position.clone()
        client.player.direction = direction
        client.player.last_edge_check_position = position.clone()
        self.player_x = client.player.position.x
        self.player_y = client.player.position.y
        self.player_direction = client.player.direction
        # Start Tracking Player
        client.player.on_change_position()
        client.player.join_time = time.time()
        # Send Ready To Start

        client.player.generate_player_colors()


        # Notify Area Around Player Is Filled
        blocks_rect = client.game_server.map.fill_new_player_blocks(client.player)
        # Save Player Captured Blocks Into Player Captured Blocks
        client.game_server.map.players_captured_blocks.add_player(client.player, blocks_rect)
        client.send(self)
        # client.send(client.player.generate_state_packet())
        # Send Player State To All Players
        client.game_server.broadcast_player_state(client.player)
        # Send ViewPort To Player
        client.player.send_player_viewport()


        client.player.is_send_ready_packet = True
        client.player.is_alive = True

    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_int_in_bytes(self.player_x, 2)
        writer.write_int_in_bytes(self.player_y, 2)
        writer.write_string(self.player_direction)
        writer.write_int_in_bytes(self.user_id, 4)



        return writer.finalize()
