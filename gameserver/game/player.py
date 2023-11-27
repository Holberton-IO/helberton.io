from gameserver.utils.colors import Colors
from gameserver.utils.game_math import *
from gameserver.game.vector import Vector
from gameserver.game.rect import Rectangle
from gameserver.network.packets.player_state import PlayerStatePacket
from gameserver.network.packets.waiting_blocks import WaitingBlocksPacket
from gameserver.game.line import Line


class Player:
    def __init__(self, game_server, client, name="", player_id=""):
        self.game = game_server
        self.client = client

        self.name = name
        self.player_id = player_id
        self.position = None
        self.last_edge_check_position = None

        self.direction = 0

        self.join_time = 0

        ## COLORS
        self.color_brighter = 0
        self.color_darker = 0
        self.color_slightlyBrighter = 0
        self.color_pattern = 0
        self.color_patternEdge = 0

        ## Capture Area
        self.capture_blocks = []
        self.waiting_bounds = Rectangle(Vector(0, 0), Vector(0, 0))
        self.current_waiting_blocks_ex_pos = 0
        self.max_waiting_blocks = 0

        # Players
        self.players_in_viewport = set()
        self.other_players_in_viewport = set()

        # TODO Hanlde Removing From Game
        self.is_removed_from_game = False

    @property
    def is_capturing(self):
        return len(self.capture_blocks) > 0

    @property
    def last_capture_block(self):
        return self.capture_blocks[-1]

    @property
    def is_dead(self):
        return False

    def generate_player_colors(self):
        self.choose_random_color()

    def on_new_player(self):
        # positionChanged
        self.game.map.fill_new_player_blocks(self)

    def choose_random_color(self):
        colors = Colors().get_random_color()

        self.color_brighter = colors["brighter"]
        self.color_darker = colors["darker"]
        self.color_slightlyBrighter = colors["slightlyBrighter"]
        self.color_pattern = colors["pattern"]
        self.color_patternEdge = colors["patternEdge"]

    def set_direction_opposite(self):
        if self.direction == "up":
            self.direction = "down"
        elif self.direction == "down":
            self.direction = "up"
        elif self.direction == "left":
            self.direction = "right"
        elif self.direction == "right":
            self.direction = "left"

    def loop(self, tick, dt, game_server):
        if self.is_dead:
            return

        last_position = self.position.clone()
        self.position = self.position.get_vector_from_direction(self.direction)

        # TODO Handle Player Movement
        # TODO Handle Player Capture Area

    def update_waiting_blocks_length_ex_pos(self):
        length = 0
        for i in range(len(self.capture_blocks) - 1):
            length += self.capture_blocks[i].distance_to(self.capture_blocks[i + 1])
        self.current_waiting_blocks_ex_pos = length

    def add_waiting_block(self, position):
        last_block_vec = self.last_capture_block
        if last_block_vec:
            if last_block_vec == position:
                return
            # Prevent Diagonal
            if last_block_vec.x != position.x and last_block_vec.y != position.y:
                raise Exception("Diagonal Capture Not Allowed")
            last_block_2 = self.capture_blocks[-2]
            if last_block_2:
                # Check if last block is in same line
                # Prevent adding block in between two blocks
                if last_block_vec.x == last_block_2.x \
                        and last_block_vec.x == position.x:
                    if last_block_vec.y <= position.y <= last_block_2.y:
                        raise Exception("Block In Between Two Blocks")
                    last_block_vec.set_y(position)
                    return
                if last_block_vec.y == last_block_2.y \
                        and last_block_vec.y == position.y:
                    if last_block_vec.x <= position.x <= last_block_2.x:
                        raise Exception("Block In Between Two Blocks")
                    last_block_vec.set_x(position)
                    return

        self.capture_blocks.append(position.clone())
        self.update_waiting_blocks_length_ex_pos()

    def update_current_block(self, last_position: Vector):
        data = self.game.map.get_valid_blocks(self.position)
        if type(data) == Player and data == self:
            # We Come Back To Our Blocks
            return

        """
        if not player.is_capturing: start capturing
        """
        if not self.is_capturing:
            self.add_waiting_block(self.position)

            return

    def add_player_to_viewport(self, player):
        if player in self.players_in_viewport:
            return

        if player.is_dead:
            return

        self.players_in_viewport.add(player)
        player.other_players_in_viewport.add(self)
        self.client.send(player.generate_state_packet())

        if player.is_dead:
            # TODO Send Kill Packet
            pass

        # TODO Send Waiting Blocks Of Added Player
        waiting_blocks_packet = WaitingBlocksPacket(player)
        self.client.send(waiting_blocks_packet)

    def remove_player_from_viewport(self, player):
        if self.is_removed_from_game:
            return
        if player not in self.players_in_viewport:
            return
        self.players_in_viewport.discard(player)
        player.other_players_in_viewport.discard(self)
        # TODO SEND REMOVED FROM VIEWPORT PACKET

    def update_player_viewport(self):
        left_players = set(self.players_in_viewport)

        for player in self.game.get_overlapping_waiting_blocks_players_rec(self.get_viewport()):
            left_players.discard(player)
            self.add_player_to_viewport(player)
        for player in left_players:
            self.remove_player_from_viewport(player)

        left_players = set(self.other_players_in_viewport)
        for player in self.game.get_overlapping_viewport_with_rec(self.waiting_bounds):
            left_players.discard(player)
            player.add_player_to_viewport(self)

        for player in left_players:
            player.remove_player_from_viewport(self)

    def on_change_position(self):
        print(f"on_change_position for {self.name}")
        # Update Blocks Bounds
        if not self.is_capturing:
            self.waiting_bounds = Rectangle(self.position.clone(), self.position.clone())
        else:
            self.waiting_bounds.expand_to(self.position)

        # Update Capture Blocks
        if self.is_capturing:
            last_block_vec = self.last_capture_block
            waiting_blocks_len = last_block_vec.distance_to(self.position) + self.current_waiting_blocks_ex_pos
            self.max_waiting_blocks = max(self.max_waiting_blocks, waiting_blocks_len)

        # Check if player is out of map
        self.update_player_viewport()

        # Check if player touches Wall
        if self.game.map.check_vector_in_walls(self.position):
            pass

        # Check if player touches waiting blocks of other players
        for other_player in self.game.get_overlapping_waiting_blocks_players_pos(self.position):
            is_my_self = other_player == self
            if not other_player.check_point_in_capture_area(self.position, is_my_self):
                continue

            killed_my_self = other_player == self
            if other_player.is_dead:
                continue

            if other_player.is_capturing:
                # Send Kill Packet
                # other_player Killed by Myself or self
                pass

            # When Two Heads Touch Each Other
            if not killed_my_self and \
                    all([other_player.is_capturing, self.is_capturing]) \
                    and other_player.position == self.position \
                    :
                # Send Kill Packet
                # other_player Killed by self
                pass
        self.send_required_edge_blocks()

    def check_point_in_capture_area(self, point, include_last_block=False):
        if not self.is_capturing:
            if include_last_block:
                return point == self.position

        # Check if point is in capture blocks
        offset = 1 if include_last_block else 2
        range_of_blocks = len(self.capture_blocks) - offset
        for i in range(range_of_blocks):
            line = Line(self.capture_blocks[i], self.capture_blocks[i + 1])
            if line.check_point_in_line(point):
                return True

        if include_last_block:
            last_block = self.last_capture_block
            line = Line(last_block, self.position)
            if line.check_point_in_line(point):
                return True
        return False

    def handle_movement(self):
        player_state_packet = PlayerStatePacket(self)
        self.client.send(player_state_packet)

    def update_tile_position(self, position):
        current_block_data = self.game.map.get_valid_blocks(position)

        if current_block_data == self:
            return

    def __repr__(self):
        return f"<Player name={self.name} id={self.player_id}>"

    def get_viewport(self):
        min_vec = self.position.add_scalar(-self.game.updates_viewport_rect_size)
        max_vec = self.position.add_scalar(self.game.updates_viewport_rect_size)
        return Rectangle(min_vec, max_vec)

    def send_player_viewport(self):
        """
        Sends Compressed ViewPort To Player
        :return:
        """
        if not self.game.map.is_valid_viewport_around(self):
            return
        for cmp_block in self.game.map.get_compressed_blocks_in(self.get_viewport()):
            self.game.map.notify_blocks_filled(cmp_block["rect"], cmp_block["data"])

    def send_rect(self, rect):
        """
        is Sends Compressed Rect To Player
        :param rect:
        :return:
        """
        if not self.game.map.is_valid_viewport_around_rect(self, rect):
            return

        for cmp_block in self.game.map.get_compressed_blocks_in(self.get_viewport()):
            self.game.map.notify_blocks_filled(cmp_block["rect"], cmp_block["data"])

    def send_required_edge_blocks(self):
        """
        Sends Required Edge Blocks To Player
        :return:
        """
        chunk_size = self.game.viewport_edge_chunk_size
        viewport_size = self.game.min_tiles_viewport_rect_size
        chunk = None
        if self.position.x >= self.last_edge_check_position.x + chunk_size:
            chunk = Rectangle(
                Vector(self.position.x + viewport_size, self.last_edge_check_position.y - viewport_size - chunk_size),
                Vector(chunk_size, (viewport_size + chunk_size) * 2)
            )
            self.last_edge_check_position.x = self.position.x

        if self.position.x <= self.last_edge_check_position.x - chunk_size:
            chunk = Rectangle(
                Vector(self.position.x - viewport_size - chunk_size,
                       self.last_edge_check_position.y - viewport_size - chunk_size),
                Vector(chunk_size, (viewport_size + chunk_size) * 2)
            )
            self.last_edge_check_position.x = self.position.x

        if self.position.y >= self.last_edge_check_position.y + chunk_size:
            chunk = Rectangle(
                Vector(self.last_edge_check_position.x - viewport_size - chunk_size,
                       self.position.y + viewport_size),
                Vector((viewport_size + chunk_size) * 2, chunk_size)
            )
            self.last_edge_check_position.y = self.position.y

        if self.position.y <= self.last_edge_check_position.y - chunk_size:
            chunk = Rectangle(
                Vector(self.last_edge_check_position.x - viewport_size - chunk_size,
                       self.position.y - viewport_size - chunk_size),
                Vector((viewport_size + chunk_size) * 2, chunk_size)
            )
            self.last_edge_check_position.y = self.position.y
        if chunk:
            rec = Rectangle(
                chunk.min,
                Vector(chunk.max.x + chunk.min.x, chunk.max.y + chunk.min.y)
            )
            self.send_rect(rec)

    def __eq__(self, other):
        if isinstance(other, Player):
            return self.player_id == other.player_id
        return False

    def __hash__(self):
        return hash(self.player_id)

    def generate_state_packet(self):
        return PlayerStatePacket(self)
