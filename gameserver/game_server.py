import math
import random
from gameserver.game.rect import Rectangle
from gameserver.game.vector import Vector
import gameserver.utils.game_math as game_math
from gameserver.network.packets import PlayerStatePacket, WaitingBlocksPacket, PlayerRemovedPacket

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass


class GameServer:
    __instance = None

    player_travel_speed = 0.006
    new_player_blocks = 2
    wall_thickness = 1
    min_tiles_viewport_rect_size = 20
    viewport_edge_chunk_size = 5
    updates_viewport_rect_size = min_tiles_viewport_rect_size + viewport_edge_chunk_size
    max_undo_event_time = 600

    '''
         ------------------------------
        |        Coming Events         |
        |    ----------------------    |
        |   |                      |   |
        |   |                      |   |
        |   |   Main Viewport      |   |
        |   |   (min_tiles_view)   |   |
        |   |                      |   |
        |   |                      |   |
        |    ----------------------    |
        |                              |
         ------------------------------
    '''

    def __new__(cls, *args, **kwargs):
        if GameServer.__instance is None:
            from gameserver.game.map import Map

            map_size = kwargs.get("map_size", 0)
            GameServer.__instance = object.__new__(cls)
            GameServer.__instance.map: Map = Map(map_size, GameServer.__instance)

        return GameServer.__instance

    def __init__(self, **kwargs):
        self.clients = []
        self.players = []
        self.player_count = 0
    def loop(self, tick, dt):
        for player in self.players:
            player.loop(tick, dt, self)

    ########################## Player Helper Functions ##########################
    def get_player_by_id(self, player_id):
        for player in self.players:
            if player.player_id == player_id:
                return player
        return None
    def add_new_player(self, player):
        self.players.append(player)
        return player
    def remove_player(self, player):
        self.players.remove(player)

        # Notify Player Closed
        self.map.reset_blocks(player)

        # Remove Player From Captured Blocks History
        self.map.players_captured_blocks.remove_player(player)

        # Send New Port For All Players
        # TODO HEAVY WORK NEED TO BE OPTIMIZED
        removed_player_packet = PlayerRemovedPacket(player)
        for p in self.players:
            p.send_player_viewport()
            p.client.send(removed_player_packet)

    def generate_random_id(self):
        # TODO We Need To Handle if ID Exceed 4 bytes (2**31 - 1)
        self.player_count += 1
        return self.player_count + 1

    def get_spawn_point(self):
        vec = Vector(
            math.floor(game_math.linear_interpolation(
                self.new_player_blocks + self.wall_thickness,
                self.map.map_size - self.new_player_blocks - self.wall_thickness,
                random.random()
            )),
            math.floor(game_math.linear_interpolation(
                self.new_player_blocks + self.wall_thickness,
                self.map.map_size - self.new_player_blocks - self.wall_thickness,
                random.random()
            ))
        )

        start_direction = self.map.get_closet_wall_direction(vec)["direction"]
        return vec, start_direction
    def get_non_fillable_blocks(self, ignore_player=None):
        for player in self.players:
            if player == ignore_player:
                continue
            yield player.position
            if player.is_capturing:
                yield list(player.get_waiting_blocks_vectors())[0]

    def notify_nearby_players(self, player, callback_if_myself, callback_if_not_myself):
        for nearby_player in player.players_see_this_player():
            if nearby_player == player:
                callback_if_myself(nearby_player)
            else:
                callback_if_not_myself(nearby_player)

    ######################## Client Helper Functions ##########################
    def add_new_client(self, client):
        self.clients.append(client)

    def remove_client(self, client):
        self.remove_player(client.player)
        self.clients.remove(client)


    ########################## Search Functions ##########################
    def get_overlapping_players_with_rec(self, rec):
        """
        Get all players overlapping with the given rectangle
        :param rec:
        :return:
        """
        for p in self.players:
            if rec.is_rect_overlap(p.get_viewport()):
                yield p

    def get_overlapping_players_with_player(self, player):
        for p in self.players:
            if player.get_viewport().is_rect_overlap(p.get_viewport()):
                yield p
    def get_overlapping_waiting_blocks_players_rec(self, rec):
        for p in self.players:
            player_waiting_blocks = p.waiting_bounds
            if rec.is_rect_overlap(player_waiting_blocks):
                yield p
    def get_overlapping_waiting_blocks_players_pos(self, pos):
        rec = Rectangle(pos.clone(), pos.clone())
        yield from self.get_overlapping_waiting_blocks_players_rec(rec)

    ########################## Broadcast Functions ##########################
    def broadcast_player_state(self, player):
        player_state_packet = PlayerStatePacket(player)
        for p in self.get_overlapping_players_with_rec(player.waiting_bounds):
            print("Player State Packet Sent To: ", p.name)
            p.client.send(player_state_packet)

    def broadcast_player_waiting_blocks(self, player):
        packet = WaitingBlocksPacket(player)
        for nearby_player in player.players_see_this_player():
            nearby_player.client.send(packet)

    def compress_rectangle_notify(self, rectangle, player):
        """
        Compress the rectangle and send this every block to the player that is in the viewport
        :param rectangle:
        :param player:
        :return:
        """
        if not self.map.is_valid_viewport_around_rect(rectangle):
            return

        for cmp_block in self.map.get_compressed_blocks_in(player.get_viewport()):
            self.map.notify_blocks_filled(cmp_block[0], cmp_block[1])