from curses.textpad import rectangle
from typing import TYPE_CHECKING

from gameserver.game.ds.graph import Graph
from gameserver.game.line import Line
from gameserver.game.system.player_captured_blocks import PlayersCapturedBlocks
from gameserver.game.vector import Vector
from gameserver.game.rect import Rectangle
from gameserver.network.packets import PlayerRemovedPacket
from gameserver.network.packets.fill_area import FillAreaPacket
from gameserver.utils.block_compressions import BlockCompression

if TYPE_CHECKING:
    from gameserver.game.player import Player


class Map:
    def __init__(self, map_size=0, game_server=None):
        self.game = game_server
        self.map_size = map_size

        self.players_captured_blocks = PlayersCapturedBlocks()
        self.map_structure = Graph(self.map_size)
        self.map_structure.init_graph()

    def __iter__(self):
        yield from self.for_each()

    def for_each(self):
        for x in range(self.map_size):
            for y in range(self.map_size):
                yield x, y

    ############################# Player Helpers ############################
    def fill_waiting_blocks(self, player):
        blocks = player.capture_blocks
        # this means that player is moving Horizontally or Vertically without
        # any 90 degree turns
        if len(blocks) == 1:
            vector = blocks[0]
            rect = Rectangle(vector, vector.add_scalar(1))
            self.fill_blocks(rect, player)

        # this means that player is moving Horizontally or Vertically with
        # 90 degree turns
        for vec in range(len(blocks) - 1):
            vector = blocks[vec]
            next_vector = blocks[vec + 1]
            # Prevent Diagonal
            if vector.x != next_vector.x and vector.y != next_vector.y:
                raise Exception("Invalid Vector")
            # Sort the two corners so that `min` is always in the top left.

            min_vec = Vector(min(vector.x, next_vector.x), min(vector.y, next_vector.y))
            max_vec = Vector(max(vector.x, next_vector.x) + 1, max(vector.y, next_vector.y) + 1)
            rec = Rectangle(min_vec, max_vec)

            self.fill_blocks(rec, player)

        # Update Player Captured Blocks In Map Memory
        for b in blocks:
            self.players_captured_blocks.expand_player_blocks_vec(player, b)

    def fill_inner_blocks_of_player_rectangle(self, player: 'Player'):
        array_of_other_players = list(self.game.get_non_fillable_blocks(ignore_player=player))
        blocks , new_player_rect = self.map_structure.get_player_blocks_inner_area(
            self, player, array_of_other_players
        )
        # Update Player Captured Blocks In Map Memory
        self.players_captured_blocks.update_player_blocks(player, new_player_rect)
        for cmp_block in blocks:
            ## [0] is rect , [1] is data
            for x, y in cmp_block[0]:
                """
                update map blocks
                """
                self.game.map.map_structure.graph[x][y] = cmp_block[1]
            self.game.map.notify_blocks_filled(cmp_block[0], cmp_block[1])


    def fill_new_player_blocks(self, player: 'Player'):
        blocks_num = self.game.new_player_blocks
        initial_reversed_blocks = (blocks_num * 2) + 1
        initial_reversed_blocks *= initial_reversed_blocks

        min_vec = player.position.add_scalar(-blocks_num)
        max_vec = player.position.add_scalar(blocks_num + 1)
        rect = Rectangle(min_vec, max_vec)
        self.fill_blocks(rect, player)
        return rect

    def fill_killed_player_blocks(self, killer, killed):
        # Replace Player Blocks
        killed_blocks_memory: 'Rectangle' = self.players_captured_blocks.get_player_blocks(killed)
        blocks = self.map_structure.get_all_player_blocks(self,killed)

        for rec,data in blocks:
            self.fill_blocks(rec, killer)

        self.players_captured_blocks.remove_player(killed)
        self.players_captured_blocks.expand_player_blocks_rec(killer, killed_blocks_memory)

        killed.is_alive = False
        killed.game.remove_player(killed)

        remove_player_packet = PlayerRemovedPacket(killed)
        killer.client.send(remove_player_packet)
    ####################### Geometry Helpers ############################
    def compress_blocks_in(self, rect, call_back):
        block_compression = BlockCompression(self.map_structure.graph, call_back).compress_inside_rectangle(rect)
        return block_compression

    def get_compressed_blocks_in(self, rect):
        rect = rect.clamp_to_min_max(0, self.map_size)

        def compress_data(x, y):
            return self.map_structure.graph[x][y]

        compressed_blocks = self.compress_blocks_in(rect, compress_data)
        for cmp_block in compressed_blocks:
            yield cmp_block

    def get_valid_blocks(self, vector):
        if not vector.is_vector_in_map(self.map_size):
            raise Exception("Vector is not in map")
        return self.map_structure[vector.x][vector.y]

    def reset_blocks(self, player):
        """
        When Player Close The Game We Reset Blocks To Non Captured
        we will reset all blocks that player own
        :param player:
        :return:
        """

        def reset_func(data: any):
            return data == player

        self.map_structure.reset_vertex(reset_func)

    def is_valid_viewport_around(self, player):
        blocks_num = self.game.updates_viewport_rect_size
        rect = Rectangle(
            player.position.add_scalar(-blocks_num),
            player.position.add_scalar(blocks_num)
        ).clamp_to_min_max(0, self.map_size)

        width = rect.max.x - rect.min.x
        height = rect.max.y - rect.min.y
        if width <= 0 or height <= 0:
            return False
        return True

    def is_valid_viewport_around_rect(self, rect):
        rect = rect.clamp_to_min_max(0, self.map_size)

        width = rect.max.x - rect.min.x
        height = rect.max.y - rect.min.y
        if width <= 0 or height <= 0:
            return False
        return True

    def check_vector_in_walls(self, vector):
        if vector.x <= 0 or vector.x >= self.map_size - 1 or \
                vector.y <= 0 or \
                vector.y >= self.map_size - 1:
            return True
        return False

    def get_closet_wall_direction(self, vector):
        """
        :param vector: Vector
        :return: Vector
        """
        wall_direction = [
            {
                "direction": "up",
                "distance": self.map_size - vector.y
            },
            {
                "direction": "down",
                "distance": vector.y
            },
            {
                "direction": "left",
                "distance": self.map_size - vector.x
            },
            {
                "direction": "right",
                "distance": vector.x
            }
        ]

        return min(wall_direction, key=lambda x: x["distance"])
    ########################## GameServer Helpers ############################
    def fill_blocks(self, rect, player: 'Player'):
        """
        Fill Blocks Inside The Given Rectangle With The Player
        :param rect:
        :param player:
        :return:
        """
        self.map_structure.fill_vertex(rect, player)
        self.notify_blocks_filled(rect, player)


    def notify_blocks_filled(self, rect, player):
        area_packet = FillAreaPacket(rect, player)
        for p in self.game.get_overlapping_players_with_rec(rect):
            p.client.send(area_packet)

    ################## Printing ###############
    def draw_map_as_text_with_players_positions(self):
        print("  ", end="")
        for col in range(self.map_size):
            print(f"{col:>2} ", end="")
        print()

        players_positions = {}
        for player in self.game.players:
            players_positions[Vector(player.position.x, player.position.y)] = player

        players_viewport = {}
        for player in self.game.players:
            for x, y in player.get_viewport().all_points_in_border():
                players_viewport[Vector(x, y)] = player

        players_waiting = {}
        for p in self.game.players:
            all_lines_from_path = []
            if not p.capture_blocks:
                continue
            for i in range(len(p.capture_blocks) - 1):
                all_lines_from_path.append(Line(p.capture_blocks[i], p.capture_blocks[i + 1]))
            all_lines_from_path.append(Line(p.capture_blocks[-1], p.position))
            for line in all_lines_from_path:
                for x, y in line.for_each():
                    players_waiting[Vector(x, y)] = p

        for x in range(self.map_size):
            print(f"{x:>2} ", end="")
            for y in range(self.map_size):
                data = self.map_structure.graph[y][x]
                position = Vector(y, x)

                # Draw Players Positions
                if position in players_positions:
                    player = players_positions[position]
                    print(f"\033[1;35m{player.player_id}\033[0m ", end=" ")
                    continue

                # Draw Waiting Players
                if Vector(y, x) in players_waiting:
                    player = players_waiting[Vector(y, x)]
                    print(f"\033[1;34m{player.player_id}\033[0m ", end=" ")
                    continue

                if isinstance(data, int):
                    if data == 0:
                        print(f"\033[1;31mX\033[0m ", end=" ")

                    elif position in players_viewport:
                        player = players_viewport[position]
                        print(f"\033[1;40m{player.player_id}\033[0m ", end=" ")
                        continue
                    elif data == 1:
                        print("O ", end=" ")



                else:
                    player = data
                    print(f"\033[1;3{player.player_id}m{player.player_id}\033[0m ", end=" ")
                    continue

            print()

    def draw_map_as_text(self):
        print("  ", end="")
        for col in range(self.map_size):
            print(f"{col:>2} ", end="")
        print()

        n = self.map_size
        for x in range(self.map_size):
            print(f"{x:>2} ", end="")
            for y in range(self.map_size):
                data = self.map_structure.graph[x][y]
                if isinstance(data, int):
                    if data == 0:
                        print(f"\033[1;31mX\033[0m ", end=" ")
                    elif data == 1:
                        print("O ", end=" ")
                else:
                    player = data
                    print(f"\033[1;3{player.player_id}m{player.player_id}\033[0m ", end=" ")
            print()
