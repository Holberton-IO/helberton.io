import time

from gameserver.network.packet import Packet
from gameserver.network.utils.writer import Writer

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from gameserver.client import GameClient


class ReadyPacket(Packet):
    PACKET_ID = 1002
    def __init__(self, user_id=0, map_size=0):
        super().__init__()
        self.packet_id = self.PACKET_ID
        self.user_id = user_id
        self.map_size = map_size
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

    def handle_packet(self, client: 'GameClient'):
        """On Received Ready Packet"""
        print(client.player.name, "is ready")

        self.map_size = client.game_server.map.map_size
        self.player_name = client.player.name
        self.user_id = client.player.player_id

        # Add Player To Game Server
        client.game_server.add_new_player(client.player)

        # Set Player Position
        position, direction = client.game_server.get_spawn_point()
        client.player.position = position
        client.player.start_position = position.clone()
        client.player.direction = direction
        client.player.last_edge_check_position = position.clone()
        self.player_x = client.player.position.x
        self.player_y = client.player.position.y
        self.player_direction = client.player.direction
        print("On Ready Packet", self.player_x, self.player_y, self.player_direction
              ,f"Id {self.user_id}"

              )

        """
        Set Player Colors
        """
        client.player.generate_player_colors()

        self.color_brighter = client.player.color_brighter
        self.color_darker = client.player.color_darker
        self.color_slightlyBrighter = client.player.color_slightlyBrighter
        self.color_pattern = client.player.color_pattern
        self.color_patternEdge = client.player.color_patternEdge

        # Start Tracking Player
        client.player.on_change_position()
        client.player.join_time = time.time()

        # Notify Area Around Player Is Filled
        blocks_rect = client.game_server.map.fill_new_player_blocks(client.player)
        # Save Player Captured Blocks Into Player Captured Blocks
        client.game_server.map.players_captured_blocks.add_player(client.player, blocks_rect)

        # Send Player State To All Players
        client.game_server.broadcast_player_state(client.player)

        # Send ViewPort To Player
        client.player.send_player_viewport()

        # Send Ready To Start
        client.send(self)
        client.player.is_send_ready_packet = True # To Start Player Movement [ Loop ]

    def finalize(self):
        writer = Writer(self.packet_id)
        writer.write_int_in_bytes(self.user_id, 4)
        writer.write_int_in_bytes(self.map_size, 2)
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
