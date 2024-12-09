from gameserver.game.objects.h_object import HObject
from gameserver.network.packets.stop_draw_waiting_blocks import StopDrawWaitingBlocksPacket
from gameserver.utils.colors import Colors
from gameserver.game.vector import Vector
from gameserver.game.rect import Rectangle
from gameserver.network.packets.player_state import PlayerStatePacket
from gameserver.game.line import Line
import gameserver.utils.game as game_utils

from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from gameserver.game.vector import Vector


class Player(HObject):
    def __init__(self, game_server, client, name="", player_id=""):
        super().__init__(game_server, client, player_id, name)
        self.is_send_ready_packet = False
        self.player_id = player_id


        # Movement
        self.movement_queue = []
        self.lashCertainClientPos = None


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
        self.total_physical_blocks = 0



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


    def choose_random_color(self):
        colors = Colors().get_random_color()

        self.color_brighter = colors["brighter"]
        self.color_darker = colors["darker"]
        self.color_slightlyBrighter = colors["slightlyBrighter"]
        self.color_pattern = colors["pattern"]
        self.color_patternEdge = colors["patternEdge"]

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
            self.parse_movement_queue()




    def clear_waiting_blocks(self):
        self.capture_blocks = []
        self.current_waiting_blocks_ex_pos = 0
    def update_current_block(self, last_position: Vector):
        data = self.game.map.get_valid_blocks(self.position)
        if type(data) == Player and self.is_capturing:
            # We Come Back To Our Blocks
            if data == self:
                # Player Make Cycle Move To Capture Blocks
                self.add_waiting_block(last_position)
                self.game.map.fill_waiting_blocks(self)
                self.game.map.fill_inner_blocks_of_player_rectangle(self)
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


    def kill_player(self, killed_player):
        if killed_player.is_dead:
            return

        is_my_player = killed_player == self
        killed_player.is_alive = False

        if not is_my_player:
            print(f"Player {killed_player.name} Killed By {self.name}")
            self.game.map.fill_killed_player_blocks(self, killed_player)
            # self.send_capture_blocks()
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








    def __eq__(self, other):
        if isinstance(other, Player):
            return self.player_id == other.player_id
        return False

    def __hash__(self):
        return hash(self.player_id)

    def __repr__(self):
        return f"<Player name={self.name} id={self.player_id}>"





    ############## Syncing ###############3
    def is_future_position(self, new_pos):
        """
        Is Client Faster Than Server
        :param new_pos:
        :return:
        """

        if self.direction == "up" and new_pos.y < self.position.y:
            return True
        if self.direction == "down" and new_pos.y > self.position.y:
            return True

        if self.direction == "left" and new_pos.x < self.position.x:
            return True

        if self.direction == "right" and new_pos.x > self.position.x:
            return True
        return False

    ################# Waiting Blocks #####################
    def get_waiting_blocks_vectors(self):
        for vector in self.capture_blocks:
            yield vector.clone()

    ##################### Movements ##########################
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

        # Check if there is player enter or leave currect player viewport
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

        self.send_required_edge_blocks()

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
            self.game.compress_rectangle_notify(rec, self)

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



    def get_random_direction_but_not_opposite(self):
        return game_utils.get_random_direction_but_not_opposite(self.direction)

    def parse_movement_queue(self):

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

    def check_move_is_valid(self, new_direction, new_pos):
        # Prevent Opposite Direction
        if game_utils.check_is_dir_with_opposite(self.direction, new_direction):
            return False
        # Prevent Same Direction
        if self.direction == new_direction:
            return False

        ### TODO HANDEL CASES IN PAPER

        #

        return True

    ############# Game Server ######################
    def invalid_movement_detected(self):
        print("Invalid Movement")
        player_state_packet = PlayerStatePacket(self)
        self.client.send(player_state_packet)

    def notify_empty_waiting_blocks(self):
        last_block_vec = self.last_capture_block

        stop_drawing_packet = StopDrawWaitingBlocksPacket(self, last_block_vec)
        nearby_player_call_back = lambda nearby_player: nearby_player.client.send(stop_drawing_packet)
        self.game.notify_nearby_players(self, nearby_player_call_back, nearby_player_call_back)
        print("Notify Empty Waiting Blocks")

    def players_see_this_player(self):
        """
        This Player is in Viewport of Other Players Viewport [ The Current Player is Considered as Other Player]
        :return:
        """
        for player in self.other_players_in_viewport:
            yield player

    ######### Packets Related ##############
    def client_update_pos(self, direction, pos):
        """
        Called From Direction Packet
        :param direction:
        :param pos:
        :return:
        """
        self.movement_queue.append((direction, pos))
        self.parse_movement_queue()

    def generate_state_packet(self):
        """
        Generate Player State Packet
        :return:
        """
        return PlayerStatePacket(self)





    def on_removed(self):
        self.game.players.remove(self)
        # Notify Player Closed
        self.game.map.reset_blocks(self)
        # Remove Player From Captured Blocks History
        self.game.map.players_captured_blocks.remove_player(self)
        self.game.broadcast_player_removed(self)



    def on_occupied_blocks(self,ob,include_last_block=False):
        area = ob.area()
        if include_last_block:
            area += 1
        self.total_physical_blocks += area
        self.game.map.on_remove_blocks_from_player(ob, self)


    def on_take_area_from_player(self):
        # TODO Think How To Optimize This
        self.total_physical_blocks -= 1

    @property
    def occupied_percentage(self):
        return (self.total_physical_blocks / self.game.map.total_blocks) * 100