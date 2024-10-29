from typing import TYPE_CHECKING

from gameserver.game.system.player_captured_blocks import PlayersCapturedBlocks
from gameserver.game.vector import Vector
from gameserver.game.rect import Rectangle
from gameserver.network.packets.fill_area import FillAreaPacket
from gameserver.utils.block_compressions import BlockCompression

if TYPE_CHECKING:
    from gameserver.game.player import Player


class Map:
    def __init__(self, map_size=0, game_server=None):
        self.game = game_server
        self.map_size = map_size
        self.blocks = []
        self.blocks_mask = []
        self.players_captured_blocks = PlayersCapturedBlocks()

        self.create_blocks()

    def create_blocks(self):
        self.blocks = [[1] * self.map_size for i in range(self.map_size)]
        self.blocks_mask = [[1] * self.map_size for i in range(self.map_size)]
        # Create Walls
        for i in range(self.map_size):
            self.blocks[i][0] = 0
            self.blocks[i][self.map_size - 1] = 0
            self.blocks[0][i] = 0
            self.blocks[self.map_size - 1][i] = 0

            self.blocks_mask[i][0] = -1
            self.blocks_mask[i][self.map_size - 1] = -1
            self.blocks_mask[0][i] = -1
            self.blocks_mask[self.map_size - 1][i] = -1

    def get_valid_blocks(self, vector):
        if not vector.is_vector_in_map(self.map_size):
            raise Exception("Vector is not in map")
        return self.blocks[vector.x][vector.y]



    def fill_blocks(self, rect, player: 'Player'):
        rect = rect.clamp(Rectangle(
            Vector(0, 0),
            Vector(self.map_size, self.map_size)
        ))
        for x, y in rect.for_each():
            self.blocks[x][y] = player

        self.notify_blocks_filled(rect, player)

    """
         Will Search For all Players That Overlap With The Given Rectangle
            And Notify Them That The Blocks Inside The Rectangle Are Filled
            
            Send --> [FillAreaPacket]
     """
    def notify_blocks_filled(self, rect, player):
        area_packet = FillAreaPacket(rect, player)
        for p in self.game.get_overlapping_players_with_rec(rect):
            p.client.send(area_packet)

    def get_compressed_blocks_in(self, rect):
        rect = rect.clamp(
            Rectangle(
                Vector(0, 0),
                Vector(self.game.map.map_size, self.game.map.map_size)
            )
        )

        def call_back(x, y):
            return self.blocks[x][y]

        compressed_blocks = self.compress_blocks_in(rect, call_back)
        for cmp_block in compressed_blocks:
            yield cmp_block

    def fill_new_player_blocks(self, player: 'Player'):
        blocks_num = self.game.new_player_blocks
        initial_reversed_blocks = (blocks_num * 2) + 1
        initial_reversed_blocks *= initial_reversed_blocks

        min_vec = player.position.add_scalar(-blocks_num)
        max_vec = player.position.add_scalar(blocks_num + 1)
        rect = Rectangle(min_vec, max_vec)
        self.fill_blocks(rect, player)
        return rect

    def is_valid_viewport_around(self, player):
        blocks_num = self.game.updates_viewport_rect_size
        rect = Rectangle(
            player.position.add_scalar(-blocks_num),
            player.position.add_scalar(blocks_num)
        ).clamp(Rectangle(
            Vector(0, 0),
            Vector(self.map_size, self.map_size)
        ))

        width = rect.max.x - rect.min.x
        height = rect.max.y - rect.min.y
        if width <= 0 or height <= 0:
            return False
        return True

    def is_valid_viewport_around_rect(self, rect):
        rect = rect.clamp(Rectangle(
            Vector(0, 0),
            Vector(self.map_size, self.map_size)
        ))

        width = rect.max.x - rect.min.x
        height = rect.max.y - rect.min.y
        if width <= 0 or height <= 0:
            return False
        return True

    def compress_blocks_in(self, rect, call_back):
        block_compression = BlockCompression(self.blocks, call_back).compress_inside_rectangle(rect)
        return block_compression

    def check_vector_in_walls(self, vector):
        if vector.x <= 0 or vector.x >= self.map_size - 1 or \
                vector.y <= 0 or \
                vector.y >= self.map_size - 1:
            return True
        return False

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

    def for_each(self):
        for x in range(self.map_size):
            for y in range(self.map_size):
                yield x, y

    def reset_blocks(self, player):
        """
        When Player Close The Game We Reset Blocks To Non Captured
        :param player:
        :return:
        """

        for x, y in self.for_each():
            if self.blocks[x][y] == player:
                self.blocks[x][y] = 1

    def create_mask_of_blocks(self, rect, value_of_mask):
        for x, y in rect.for_each():
            self.blocks_mask[x][y] = value_of_mask
        return self.blocks_mask

    def can_fill_node(self, node, mask, player_capture_blocks, player):
        if node.x < player_capture_blocks.min.x or \
                node.y < player_capture_blocks.min.y:
            return False
        if node.x >= player_capture_blocks.max.x or \
                node.y >= player_capture_blocks.max.y:
            return False

        if mask[node.x][node.y] == 1 or mask[node.x][node.y] == -1:
            return False

        return self.blocks[node.x][node.y] != player

    def update_captured_area(self, player, other_player_locations):
        player_capture_blocks = self.players_captured_blocks.get_player_blocks(player)
        player_capture_blocks = Rectangle(
            player_capture_blocks.min.clone().add_scalar(-1),
            player_capture_blocks.max.clone().add_scalar(1)
        )
        mask = self.create_mask_of_blocks(player_capture_blocks, 0)
        corner_seed = player_capture_blocks.min.clone()
        nodes = [corner_seed]
        for position in other_player_locations:
            nodes.extend(
                [
                    position.clone().add(Vector(0, 1)),
                    position.clone().add(Vector(0, -1)),
                    position.clone().add(Vector(1, 0)),
                    position.clone().add(Vector(-1, 0)),

                ]
            )

        while True:
            if len(nodes) == 0:
                break
            node = nodes.pop()

            if self.can_fill_node(node, mask, player_capture_blocks, player):
                mask[node.x][node.y] = 1
                nodes.extend(
                    [
                        node.clone().add(Vector(0, 1)),
                        node.clone().add(Vector(0, -1)),
                        node.clone().add(Vector(1, 0)),
                        node.clone().add(Vector(-1, 0)),
                    ]
                )

        new_player_capture_blocks = Rectangle(
            Vector(float("inf"), float("inf")),
            Vector(float("-inf"), float("-inf"))
        )

        for x, y in player_capture_blocks.for_each():
            if mask[x][y] == 0 or self.blocks[x][y] == player:
                new_player_capture_blocks.expand_to_rect(
                    Rectangle(Vector(x, y), Vector(x + 1, y + 1))
                )

        def call_back(cx, cy):
            if mask[cx][cy] == 0 and self.blocks[cx][cy] != player:
                return player
            return None

        compressed_blocks = self.compress_blocks_in(player_capture_blocks, call_back)
        return compressed_blocks, new_player_capture_blocks

    def draw_map_as_text(self):
        print("  ", end="")
        for col in range(self.map_size):
            print(f"{col:>2} ", end="")
        print()

        n= self.map_size
        for x in range(self.map_size):
            print(f"{x:>2} ", end="")
            for y in range(self.map_size):
                data = self.blocks[x][y]
                if isinstance(data, int):
                    if data == 0:
                        print(f"\033[1;31mX\033[0m ", end=" ")
                    elif data == 1:
                        print("O ", end=" ")
                else:
                    player = data
                    print(f"\033[1;3{player.player_id}m{player.player_id}\033[0m ", end=" ")
            print()



    def replace_player_blocks(self, killer, killed):
        # Replace Player Blocks


        for x, y in self.for_each():
            if self.blocks[x][y] == killed:
                self.blocks[x][y] = killer



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
            yy = Rectangle(p.waiting_bounds.min, p.waiting_bounds.max)
            yy.expand_to(Vector(yy.max.x + 1, yy.max.y + 1))
            for x, y in yy.for_each():
                players_waiting[Vector(x, y)] = p


        for x in range(self.map_size):
            print(f"{x:>2} ", end="")
            for y in range(self.map_size):
                data = self.blocks[y][x]
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


    def __str__(self):
        from io import StringIO
        output = StringIO()

        # Print column headers
        output.write("  ")
        for col in range(self.map_size):
            output.write(f"{col:>2} ")
        output.write("\n")

        players_positions = {}
        for player in self.game.players:
            players_positions[Vector(player.position.x, player.position.y)] = player

        players_viewport = {}
        for player in self.game.players:
            for x, y in player.get_viewport().all_points_in_border():
                players_viewport[Vector(x, y)] = player

        players_waiting = {}
        for p in self.game.players:
            yy = Rectangle(p.waiting_bounds.min, p.waiting_bounds.max)
            yy.expand_to(Vector(yy.max.x + 1, yy.max.y + 1))
            for x, y in yy.for_each():
                players_waiting[Vector(x, y)] = p

        for x in range(self.map_size):
            output.write(f"{x:>2} ")
            for y in range(self.map_size):
                data = self.blocks[y][x]
                position = Vector(y, x)

                # Draw Players Positions
                if position in players_positions:
                    player = players_positions[position]
                    output.write(f"\033[1;35m{player.player_id}\033[0m ")
                    continue

                # Draw Waiting Players
                if Vector(y, x) in players_waiting:
                    player = players_waiting[Vector(y, x)]
                    output.write(f"\033[1;34m{player.player_id}\033[0m ")
                    continue

                if isinstance(data, int):
                    if data == 0:
                        output.write(f"\033[1;31mX\033[0m ")

                    elif position in players_viewport:
                        player = players_viewport[position]
                        output.write(f"\033[1;40m{player.player_id}\033[0m ")
                        continue
                    elif data == 1:
                        output.write("O ")

                else:
                    player = data
                    output.write(f"\033[1;3{player.player_id}m{player.player_id}\033[0m ")
                    continue

            output.write("\n")

        # Return the accumulated string
        return output.getvalue()
