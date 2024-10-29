from gameserver.network.packets.stop_draw_waiting_blocks import StopDrawWaitingBlocksPacket
from gameserver.utils.colors import Colors
from gameserver.game.vector import Vector
from gameserver.game.rect import Rectangle
from gameserver.network.packets.player_state import PlayerStatePacket
from gameserver.network.packets.waiting_blocks import WaitingBlocksPacket
from gameserver.game.line import Line
from gameserver.utils.game import *

from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from gameserver.game.vector import Vector


class Player:
    def __init__(self, game_server, client, name="", player_id=""):
        self.game = game_server
        self.client = client
        self.is_send_ready_packet = False

        # Movement
        self.movement_queue = []
        self.lashCertainClientPos = None

        self.name = name
        self.player_id = player_id
        self.position: Optional['Vector'] = None
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
        self.waiting_bounds: Rectangle = Rectangle(Vector(0, 0), Vector(0, 0))
        self.current_waiting_blocks_ex_pos = 0
        self.max_waiting_blocks = 0

        # Players
        self.players_in_viewport = set()
        self.other_players_in_viewport = set()

        # TODO Hanlde Removing From Game
        self.is_removed_from_game = False

        self.start_position = None
        self.next_tile_progress = 0


        self.is_moving = False
        self.is_alive = True


    def stop_movement(self):
        self.is_moving = True

    def start_movement(self):
        self.is_moving = False

    @property
    def is_capturing(self):
        return len(self.capture_blocks) > 0

    @property
    def last_capture_block(self):
        if len(self.capture_blocks) == 0:
            return None
        return self.capture_blocks[-1]

    @property
    def is_dead(self):
        return not self.is_alive

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
        if not self.is_send_ready_packet:
            return

        if self.is_dead:
            return
        player_speed = self.game.player_travel_speed
        self.next_tile_progress += dt * player_speed

        if self.is_moving:
            return

        if self.next_tile_progress > 1:
            self.next_tile_progress -= 1
            last_position = self.position.clone()
            self.position = self.position.get_vector_from_direction(self.direction)
            if self.position.is_vector_has_negative() or self.game.map.check_vector_in_walls(self.position):
                self.position = last_position.clone()

            self.update_current_block(last_position)
            self.on_change_position()
            self.pares_movement_queue()

    def update_waiting_blocks_length_ex_pos(self):
        length = 0
        for i in range(len(self.capture_blocks) - 1):
            length += self.capture_blocks[i].distance_to(self.capture_blocks[i + 1])
        self.current_waiting_blocks_ex_pos = length

    def add_waiting_block(self, position):
        # print("Add Waiting Block: ", self.capture_blocks)
        # print("----- -> ", self.position)
        last_block_vec = self.last_capture_block
        if last_block_vec:
            if last_block_vec == position:
                return
            # Prevent Diagonal
            if last_block_vec.x != position.x and last_block_vec.y != position.y:
                raise Exception("Diagonal Capture Not Allowed")

            last_block_2 = None if len(self.capture_blocks) < 2 else self.capture_blocks[-2]
            if last_block_2:
                # Check if last block is in same line
                # Prevent adding block in between two blocks
                if last_block_vec.x == last_block_2.x and last_block_vec.x == position.x:
                    if last_block_vec.y <= position.y <= last_block_2.y:
                        return
                        # raise Exception("Block In Between Two Blocks")
                    last_block_vec.set_y(position)
                    return
                if last_block_vec.y == last_block_2.y and last_block_vec.y == position.y:
                    if last_block_vec.x <= position.x <= last_block_2.x:
                        return
                        # raise Exception("Block In Between Two Blocks")
                    last_block_vec.set_x(position)
                    return

        self.capture_blocks.append(position.clone())
        self.update_waiting_blocks_length_ex_pos()

    def send_capture_blocks(self):
        array_of_other_players = list(self.game.get_non_fillable_blocks(self))
        compressed_blocks, new_player_blocks = self.game.map.update_captured_area(
            self, array_of_other_players
        )
        self.game.map.players_captured_blocks.update_player_blocks(self, new_player_blocks)
        for cmp_block in compressed_blocks:
            for x, y in cmp_block["rect"].for_each():
                """
                update map blocks
                """
                self.game.map.blocks[x][y] = cmp_block["data"]
            self.game.map.notify_blocks_filled(cmp_block["rect"], cmp_block["data"])

    def clear_waiting_blocks(self):
        self.capture_blocks = []
        self.current_waiting_blocks_ex_pos = 0

    def notify_empty_waiting_blocks(self):
        last_block_vec = self.last_capture_block

        stop_drawing_packet = StopDrawWaitingBlocksPacket(self, last_block_vec)
        nearby_player_call_back = lambda nearby_player: nearby_player.client.send(stop_drawing_packet)
        self.game.notify_nearby_players(self, nearby_player_call_back, nearby_player_call_back)
        print("Notify Empty Waiting Blocks")

    def update_current_block(self, last_position: Vector):
        data = self.game.map.get_valid_blocks(self.position)
        if type(data) == Player and self.is_capturing:
            # We Come Back To Our Blocks
            if data == self:
                # Player Make Cycle Move To Capture Blocks
                self.add_waiting_block(last_position)
                self.game.map.fill_waiting_blocks(self)
                self.send_capture_blocks()
                self.notify_empty_waiting_blocks()
                self.clear_waiting_blocks()

        """
        if not player.is_capturing: start capturing
        """
        if (isinstance(data, int) and data == 1) or data != self:
            if not self.is_capturing:
                self.add_waiting_block(self.position)
                self.game.broadcast_player_waiting_blocks(self)
                return

    def add_player_to_viewport(self, player):
        if player in self.players_in_viewport:
            return

        if player.is_dead:
            return

        """
         Add This Player To Current Player Viewport 
         this means that player will receive updates from this player
         and this player will receive updates from this player 
        
        """
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
        # TODO SEND REMOVED FROM VIEWPORT PACKET (IMPORTANT)

    def update_player_viewport(self):
        # Consider All Players In Viewport As Left Players
        left_players = set(self.players_in_viewport)

        """ 
          If Current Player Viewport Overlaps With Other Players Waiting Blocks
          Mark This Player As In Viewport Of Current Player
        
        """


        """
           0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 
         0 X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  
         1 X  3  3  3  3  3  O  O  O  O  O  O  O  O  O  O  O  O  O  X  
         2 X  3  3  3  3  3  O  O  O  O  O  O  O  O  O  O  O  O  O  X  
         3 X  3  3  3  3  3  O  O  O  O  O  O  O  O  O  O  O  O  O  X  
         4 X  3  3  3  3  3  O  O  O  O  O  O  O  O  O  O  O  O  O  X  
         5 X  3  3  3  3  3  2  2  2  O  O  O  O  O  O  O  O  O  O  X  
         6 X  O  O  3  O  O  O  O  2  O  O  O  O  O  O  O  O  O  O  X  
         7 X  O  O  3  O  O  O  O  2  O  O  O  O  O  O  O  O  O  O  X  
         8 X  O  O  3  O  O  O  O  2  O  O  O  2  2  2  2  2  O  O  X  
         9 X  3  3  3  3  3  3  3  3  O  O  O  2  2  2  2  2  O  O  X  
        10 X  O  O  2  2  2  2  2  2  2  2  2  2  2  2  2  2  O  O  X  
        11 X  O  O  3  O  O  O  O  3  O  O  O  2  2  2  2  2  O  O  X  
        12 X  O  O  3  O  O  O  O  3  O  O  O  2  2  2  2  2  O  O  X  
        13 X  O  O  3  O  O  O  O  3  O  O  O  O  O  O  O  O  O  O  X  
        14 X  O  O  3  O  O  O  O  3  O  O  O  O  O  O  O  O  O  O  X  
        15 X  2  2  2  2  2  2  2  3  O  O  O  O  O  O  O  O  O  O  X  
        16 X  O  O  O  O  O  O  O  3  O  O  O  O  O  O  O  O  O  O  X  
        17 X  O  O  O  O  O  O  O  3  O  O  O  O  O  O  O  O  O  O  X  
        18 X  O  O  O  O  O  O  O  3  O  O  O  O  O  O  O  O  O  O  X  
        19 X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  
        """

        # Current Player View Port with [Waiting Blocks] of Other Players
        for player in self.game.get_overlapping_waiting_blocks_players_rec(self.get_viewport()):
            left_players.discard(player)
            self.add_player_to_viewport(player)

        for player in left_players:
            self.remove_player_from_viewport(player)



        left_players = set(self.other_players_in_viewport)
        # Other Players View Port with [Waiting Blocks] of Current Player
        for player in self.game.get_overlapping_viewport_with_rec(self.waiting_bounds):
            left_players.discard(player)
            player.add_player_to_viewport(self)

        for player in left_players:
            player.remove_player_from_viewport(self)

    def on_change_position(self):
        # Update Blocks Bounds
        if not self.is_capturing:
            self.waiting_bounds = Rectangle(self.position.clone(), self.position.clone())
        else:
            self.waiting_bounds.expand_to(self.position)

        # Update Capture Blocks
        if self.is_capturing:
            last_block_vec = self.last_capture_block
            waiting_blocks_len = last_block_vec.distance_to(self.position) + self.current_waiting_blocks_ex_pos
            self.max_waiting_blocks = max(self.max_waiting_blocks, int(waiting_blocks_len))

        # Check if player is out of map
        self.update_player_viewport()

        # Check if player touches Wall
        if self.game.map.check_vector_in_walls(self.position):
            pass

        # Check if player touches waiting blocks of other players
        for other_player in self.game.get_overlapping_waiting_blocks_players_pos(self.position):
            is_my_player = other_player != self
            if not other_player.check_point_in_capture_area(self.position, is_my_player):
                continue

            killed_my_self = other_player == self
            if other_player.is_dead:
                continue

            if other_player.is_capturing:
                # Send Kill Packet
                # other_player Killed by Myself or self
                self.kill_player(other_player)
                pass

            # When Two Heads Touch Each Other
            if not killed_my_self and \
                    all([other_player.is_capturing, self.is_capturing]) \
                    and other_player.position == self.position \
                    :
                # Send Kill Packet
                # other_player Killed by self
                pass
        # TODO DELAY IN SENDING EDGES
        self.send_required_edge_blocks()



    def kill_player(self,killed_player):
        if killed_player.is_dead:
            return

        is_my_player = killed_player == self
        killed_player.is_alive = False

        if not is_my_player:
            print(f"Player {killed_player.name} Killed By {self.name}")
            self.game.map.replace_player_blocks(self,killed_player)
            print(self.game.map)
            self.send_capture_blocks()
        else:
            print(f"Player {killed_player.name} Killed Himself")


    def reset_player(self):
        self.movement_queue = []
        self.lashCertainClientPos = None
        self.position = None
        self.last_edge_check_position = None
        self.direction = 0
        self.waiting_bounds = Rectangle(Vector(0, 0), Vector(0, 0))
        self.max_waiting_blocks = 0
        self.players_in_viewport = set()
        self.other_players_in_viewport = set()
        self.is_moving = False
        self.clear_waiting_blocks()

    def check_point_in_capture_area(self, point, include_last_block=True):
        if not self.is_capturing:
            if include_last_block:
                return point == self.position
            return False

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
        if not self.game.map.is_valid_viewport_around_rect(rect):
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
                Vector(self.position.x + viewport_size,
                       self.last_edge_check_position.y - viewport_size - chunk_size),
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

    def players_see_this_player(self):
        """
        This Player is in Viewport of Other Players Viewport [ The Current Player is Considered as Other Player]
        :return:
        """
        for player in self.other_players_in_viewport:
            yield player

    def client_update_pos(self, direction, pos):
        self.movement_queue.append((direction, pos))
        self.pares_movement_queue()

    def check_move_is_valid(self, new_direction, new_pos):
        # Prevent Opposite Direction
        if check_is_dir_with_opposite(self.direction, new_direction):
            return False
        # Prevent Same Direction
        if self.direction == new_direction:
            return False

        ### TODO HANDEL CASES IN PAPER

        #

        return True

    def is_future_position(self, new_pos):
        """
        Is Client Faster Than Server
        :param new_pos:
        :return:
        """
        # if new_pos == self.position:
        #     return False
        if self.direction == "up" and new_pos.y < self.position.y:
            return True
        if self.direction == "down" and new_pos.y > self.position.y:
            return True

        if self.direction == "left" and new_pos.x < self.position.x:
            return True

        if self.direction == "right" and new_pos.x > self.position.x:
            return True
        return False

    def invalid_movement_detected(self):
        print("Invalid Movement")
        player_state_packet = PlayerStatePacket(self)
        self.client.send(player_state_packet)

    def pares_movement_queue(self):

        while len(self.movement_queue) > 0:
            move = self.movement_queue[0]
            new_direction = move[0]
            new_pos = move[1]
            # Check If Touch Wall

            if self.game.map.check_vector_in_walls(new_pos):
                self.movement_queue.pop(0)
                self.invalid_movement_detected()
                continue

            is_valid = self.check_move_is_valid(new_direction, new_pos)
            if not is_valid:
                self.movement_queue.pop(0)
                self.invalid_movement_detected()
                continue

            if self.is_future_position(new_pos):
                return

            print(f"Server Position {self.position}, Client Position {new_pos}", "\n",
                  f"Start Position {self.start_position}")
            self.movement_queue.pop(0)
            prev_pos = self.position.clone()
            self.position = new_pos.clone()
            self.lashCertainClientPos = new_pos.clone()
            if self.is_capturing:
                self.add_waiting_block(self.position)

            self.direction = new_direction
            self.game.broadcast_player_state(self)
            self.update_current_block(self.position)
            self.on_change_position()

    def get_waiting_blocks_vectors(self):
        for vector in self.capture_blocks:
            yield vector.clone()


    def get_random_direction_but_not_opposite(self):
        directions = ["up", "down", "left", "right"]
        opposite = {
            "up": "down",
            "down": "up",
            "left": "right",
            "right": "left"
        }


        if self.direction:
            directions.remove(self.direction)
            directions.remove(opposite[self.direction])
        import random
        return random.choice(directions)