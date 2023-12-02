import math
import random
from gameserver.game.player import Player
from gameserver.game.map import Map
from gameserver.game.rect import Rectangle
from gameserver.game.vector import Vector
import gameserver.utils.game_math as game_math
from gameserver.network.packets import PlayerStatePacket, WaitingBlocksPacket


class GameServer:
    __instance = None

    player_travel_speed = 0.006
    new_player_blocks = 2
    wall_thickness = 1

    min_tiles_viewport_rect_size = 20
    viewport_edge_chunk_size = 5
    updates_viewport_rect_size = min_tiles_viewport_rect_size + viewport_edge_chunk_size

    def __new__(cls, *args, **kwargs):
        if GameServer.__instance is None:
            map_size = kwargs.get("map_size", 0)
            GameServer.__instance = object.__new__(cls)
            GameServer.__instance.map = Map(map_size, GameServer.__instance)

        return GameServer.__instance

    def __init__(self, **kwargs):
        self.clients = []
        self.players = []
        self.player_count = 0

    def add_new_player(self, player):
        self.players.append(player)
        return player

    def remove_player(self, player):
        self.players.remove(player)

    def add_new_client(self, client):
        self.clients.append(client)

    def remove_client(self, client):
        self.players.remove(client.player)
        self.clients.remove(client)

    def generate_random_id(self):
        # TODO We Need To Handle if ID Exceed 2 bytes (65535)
        self.player_count += 1
        return self.player_count + 1

    def get_closet_wall_direction(self, vector):
        """
        :param vector: Vector
        :return: Vector
        """
        wall_direction = [
            {
                "direction": "up",
                "distance": self.map.map_size - vector.y
            },
            {
                "direction": "down",
                "distance": vector.y
            },
            {
                "direction": "left",
                "distance": self.map.map_size - vector.x
            },
            {
                "direction": "right",
                "distance": vector.x
            }
        ]

        return min(wall_direction, key=lambda x: x["distance"])

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

        start_direction = self.get_closet_wall_direction(vec)["direction"]
        return vec, start_direction

    def get_overlapping_players_with_rec(self, rec):
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

    def get_overlapping_viewport_with_rec(self, rec):
        for p in self.players:
            if rec.is_rect_overlap(p.get_viewport()):
                yield p

    def get_overlapping_waiting_blocks_players_pos(self, pos):
        rec = Rectangle(pos, pos)
        yield from self.get_overlapping_waiting_blocks_players_rec(rec)

    def broadcast_player_state(self, player):
        player_state_packet = PlayerStatePacket(player)
        for p in self.get_overlapping_viewport_with_rec(player.waiting_bounds):
            print("Player State Packet Sent To: ", p.name)
            p.client.send(player_state_packet)

    def broadcast_player_waiting_blocks(self, player):
        packet = WaitingBlocksPacket(player)
        for nearby_player in player.player_see_this_player():
            nearby_player.client.send(packet)

    def loop(self, tick, dt):
        for player in self.players:
            player.loop(tick, dt, self)
