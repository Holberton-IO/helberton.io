from typing import TYPE_CHECKING

from gameserver.game.rect import Rectangle, RectangleBuilder
from gameserver.utils.block_compressions import BlockCompression
from gameserver.game.vector import Vector

if TYPE_CHECKING:
    from gameserver.game.player import Player


class Graph:
    def __init__(self, dimension=0):
        self.map_size = dimension
        self.graph = []
        self.graph_mask = []

    def init_graph(self):
        self.graph = [[1] * self.map_size for i in range(self.map_size)]
        self.graph_mask = [[1] * self.map_size for i in range(self.map_size)]
        # Create Walls
        for i in range(self.map_size):
            self.graph[i][0] = 0
            self.graph[i][self.map_size - 1] = 0
            self.graph[0][i] = 0
            self.graph[self.map_size - 1][i] = 0

            self.graph_mask[i][0] = -1
            self.graph_mask[i][self.map_size - 1] = -1
            self.graph_mask[0][i] = -1
            self.graph_mask[self.map_size - 1][i] = -1

    def transpose(self, ar):
        return [list(i) for i in zip(*ar)]

    def __getitem__(self, row):
        return self.graph[row]

    def fill_vertex(self, rect: 'Rectangle', value: any):
        """
        Fill Blocks Inside The Given Rectangle With The Player
        The Rectangle Will Be Clamped To The Map Size
        The Rectangle Max Will Be Exclusive
        :param rect:
        :param value:
        :return:
        """
        rect = rect.clamp_to_min_max(0, self.map_size)
        for x, y in rect:
            self.graph[x][y] = value

    def apply_mask_to_vertex(self, rect: 'Rectangle', value: any):
        """
        Apply Mask To The Given Rectangle
        The Rectangle Will Be Clamped To The Map Size
        The Rectangle Max Will Be Exclusive
        :param rect:
        :param value:
        :return:
        """
        rect = rect.clamp_to_min_max(0, self.map_size)
        for x, y in rect:
            self.graph_mask[x][y] = value
        return self.graph_mask

    def is_valid_data(self, x, y, data: any):
        return self.graph[x][y] == data

    def __iter__(self):
        for x in range(self.map_size):
            for y in range(self.map_size):
                yield x, y

    def reset_vertex(self, fun):
        for x, y in self:
            if fun(self.graph[x][y]):
                self.graph[x][y] = 1

    def bfs(self, start_vertex: 'Vector',
            other_vertex: list['Vector']

            , is_valid, on_visit):
        """
        Perform a generalized BFS.

        Args:

            start_vertex (Vector): The starting vertex.
            other_vertex (list[Vector]): The other vertex to visit wi

            is_valid (callable): Function that takes x, y and returns True if the node can be visited.
            on_visit (callable): Function to perform an action when a node is visited.

        Example:
            def is_valid(x, y):
                return 0 <= x < self.map_size and 0 <= y < self.map_size and graph_mask[x][y] == 0

            def on_visit(x, y):
                graph[x][y] = 1

            bfs([Vector(0, 0)], is_valid, on_visit)
        """
        queue = [start_vertex]
        for v in other_vertex:
            queue.extend(v.expand_in_all_directions(scalar=1))

        while queue:
            current = queue.pop(0)
            x, y = current.x, current.y
            if not is_valid(x, y):
                continue

            # Perform action on the current node
            on_visit(x, y)

            # Add neighbors to the queue
            neighbors = current.expand_in_all_directions(scalar=1)
            queue.extend(neighbors)

    ################################# Player Related Functions #################################
    def get_all_player_blocks_mask(self, game_map: 'Map', player: 'Player') -> list[list[any]]:
        """
        Get All The Blocks Owned By The Player
        :param game_map:
        :param player:
        :return:
        """
        player_blocks_rect = game_map.players_captured_blocks.get_player_blocks(player)
        player_blocks_rect = Rectangle(
            player_blocks_rect.min.clone().add_scalar(-1),
            player_blocks_rect.max.clone().add_scalar(1)
        )
        start_vertex: Vector = player_blocks_rect.min.clone()
        mask: list[list[any]] = self.apply_mask_to_vertex(player_blocks_rect, 0)

        def is_valid(x, y):
            current_node = Vector(x, y)
            # Check if the node is outside the capture block boundaries.
            if player_blocks_rect.is_vector_outside(current_node):
                return False
            # Check if the node has already been visited [1,killed] or is blocked.
            if mask[current_node.x][current_node.y] in {1, -1, player}:
                return False
            return True

        def on_visit(x, y):
            if self.graph[x][y] == player:
                mask[x][y] = player
            else:
                mask[x][y] = 1

        self.bfs(start_vertex, [], is_valid, on_visit)
        return mask
    def get_all_player_blocks(self, game_map: 'Map', player: 'Player') -> list[Vector]:
        """
        Get All The Blocks Owned By The Player
        :param game_map:
        :param player:
        :return:
        """
        player_blocks_rect = game_map.players_captured_blocks.get_player_blocks(player)
        player_blocks_rect = Rectangle(
            player_blocks_rect.min.clone().add_scalar(-1),
            player_blocks_rect.max.clone().add_scalar(1)
        )
        mask = self.get_all_player_blocks_mask(game_map, player)

        def compression_function(cx, cy):
            if mask[cx][cy] == player:
                return player
            return None

        compressed_blocks = BlockCompression(self.graph, compression_function).compress_inside_rectangle(
            player_blocks_rect)
        return compressed_blocks


    def get_inner_area_on_fill_rectangle_around_it(self, game_map: 'Map', player: 'Player',
                                                   included_vertex: list['Vector']) -> list[list[any]]:
        """
        Get the area inside the rectangle
        :param game_map:
        :param player:
        :param included_vertex:
        :return: mask of the area inside the rectangle and the values of 0 indicates the area is not visited
        and this means the area inside the rectangle is not captured by the player
        and this mean we need to fill this masked values as player complete rectangle around the area
        -1 -1 -1 -1 -1 -1 -1 -1 -1 -1
        -1  1  1  1  1  1  1  1  1 -1
        -1  1  1  1  1  1  1  1  1 -1
        -1  1  1  1  1  1  1  1  1 -1
        -1  1  1  1  0  0  0  1  1 -1
        -1  1  1  1  0  0  0  1  1 -1
        -1  1  1  1  0  0  0  1  1 -1
        -1  -1 -1 -1 -1 -1 -1 -1 -1 -1
        """
        player_blocks_rect = game_map.players_captured_blocks.get_player_blocks(player)
        player_blocks_rect = Rectangle(
            player_blocks_rect.min.clone().add_scalar(-1),
            player_blocks_rect.max.clone().add_scalar(1)
        )
        player_blocks_rect = player_blocks_rect.clamp(
            Rectangle(
                Vector(0, 0),
                Vector(self.map_size, self.map_size)
            )
        )
        mask: list[list[any]] = self.apply_mask_to_vertex(player_blocks_rect, 0)

        start_vertex: Vector = player_blocks_rect.min.clone()

        def is_valid(x, y):
            current_node = Vector(x, y)

            # Check if the node is outside the capture block boundaries.
            if player_blocks_rect.is_vector_outside(current_node):
                return False
            # Check if the node has already been visited or is blocked.
            if mask[current_node.x][current_node.y] in {1, -1}:
                return False

            # Check if the block is not owned by the player.
            return self.graph[x][y] != player

        def on_visit(x, y):
            mask[x][y] = 1

        self.bfs(start_vertex, included_vertex, is_valid, on_visit)
        return mask

    def convert_inner_area_mask_to_rect(self, mask: list[list[any]], game_map: 'Map', player: 'Player') -> 'Rectangle':
        """
        Provide the mask of the area inside the rectangle and the values of 0 indicates the area is not visited
        :param mask: The mask to convert.
        :param player: The player to check for.
        :param game_map: The player to check for.
        :return: The rectangle.
        """
        new_player_capture_blocks = Rectangle(
            Vector(float("inf"), float("inf")),
            Vector(float("-inf"), float("-inf"))
        )

        old_player_capture_blocks = game_map.players_captured_blocks.get_player_blocks(player)

        for x, y in old_player_capture_blocks.for_each():
            if mask[x][y] == 0 or self.graph[x][y] == player:
                new_player_capture_blocks.expand_to_rect(
                    Rectangle(Vector(x, y), Vector(x + 1, y + 1))
                )
        return new_player_capture_blocks

    def get_player_blocks_inner_area(self, game_map: 'Map', player: 'Player', included_vertex: list['Vector']) -> any:
        """
        Get the area inside the rectangle
        :param game_map:
        :param player:
        :param included_vertex:
        :return: The area inside the rectangle.
        """
        mask = self.get_inner_area_on_fill_rectangle_around_it(game_map, player, included_vertex)

        new_player_rect: Rectangle = self.convert_inner_area_mask_to_rect(mask, game_map, player)

        def compression_function(x, y):
            """
            Compress The Blocks If The Block Is Not Owned By The Player
            :param x:
            :param y:
            :return:
            """
            if mask[x][y] == 0 and self.graph[x][y] != player:
                return player
            return None

        compression_blocks = BlockCompression(self.graph, compression_function).compress_inside_rectangle(
            new_player_rect)
        return compression_blocks, new_player_rect
