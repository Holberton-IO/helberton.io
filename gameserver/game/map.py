from gameserver.game.system.player_captured_blocks import PlayerCapturedBlocks
from gameserver.game.vector import Vector
from gameserver.game.rect import Rectangle
from gameserver.network.packets.fill_area import FillAreaPacket
from gameserver.utils.block_compressions import BlockCompression


class Map:
    def __init__(self, map_size=0, game_server=None):
        self.game = game_server
        self.map_size = map_size
        self.blocks = []
        self.players_captured_blocks = PlayerCapturedBlocks()

        self.create_blocks()

    def create_blocks(self):
        self.blocks = [[1] * self.map_size for i in range(self.map_size)]
        # Create Walls
        for i in range(self.map_size):
            self.blocks[i][0] = 0
            self.blocks[i][self.map_size - 1] = 0
            self.blocks[0][i] = 0
            self.blocks[self.map_size - 1][i] = 0

    def get_valid_blocks(self, vector):
        if not vector.is_vector_in_map(self.map_size):
            raise Exception("Vector is not in map")
        return self.blocks[vector.x][vector.y]

    def fill_blocks(self, rect, player):
        rect = rect.clamp(Rectangle(
            Vector(0, 0),
            Vector(self.map_size, self.map_size)
        ))
        for x, y in rect.for_each():
            self.blocks[x][y] = player

        self.notify_blocks_filled(rect, player)

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
        compressed_blocks = self.compress_blocks_in(rect)
        for cmp_block in compressed_blocks:
            yield cmp_block

    def fill_new_player_blocks(self, player):
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

    def compress_blocks_in(self, rect):
        block_compression = BlockCompression(self.blocks).compress_inside_rectangle(rect)
        return block_compression

    def check_vector_in_walls(self, vector):
        if vector.x <= 0 or \
                vector.x >= self.map_size - 1 or \
                vector.y <= 0 or \
                vector.y >= self.map_size - 1:
            return True
        return False

    def fill_waiting_blocks(self, player):
        blocks = player.capture_blocks
        if len(blocks) == 1:
            vector = blocks[0]
            rect = Rectangle(vector, vector.add_scalar(1))
            self.fill_blocks(rect, player)

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
            print(rec, "Will Filled")
            self.fill_blocks(rec, player)

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

    def create_mask_of_blocks(self, value_of_mask):
        mask = [[value_of_mask] * self.map_size for i in range(self.map_size)]
        return mask

    def can_fill_node(self, node, mask, player_capture_blocks, player):
        if node.x < player_capture_blocks.min.x or \
                node.y < player_capture_blocks.min.y:
            return False
        if node.x >= player_capture_blocks.max.x or \
                node.y >= player_capture_blocks.max.y:
            return False

        if mask[node.x][node.y] == 1:
            return False

        return self.blocks[node.x][node.y] != player

    def update_captured_area(self, player, other_player_locations):
        player_capture_blocks = self.players_captured_blocks.get_player_blocks(player)
        player_capture_blocks = Rectangle(
            player_capture_blocks.min.clone().add_scalar(-1),
            player_capture_blocks.max.clone().add_scalar(1)
        )
        mask = self.create_mask_of_blocks(0)
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
            node = nodes.pop()
            if not node:
                break
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

        compressed_blocks = self.compress_blocks_in(player_capture_blocks)