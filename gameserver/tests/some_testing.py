import time
from enum import Enum
from time import sleep

from gameserver.game.line import Line
from gameserver.game.rect import Rectangle
from gameserver.game.vector import Vector
from gameserver.network.packets import DirectionPacket

def logTime(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.time() - start} seconds")
        return result

    return wrapper


class Direction(Enum):
    UP = "up"
    DOWN = "down"
    LEFT = "left"
    RIGHT = "right"

    def __str__(self):
        return self.value


def start_game_server():
    from gameserver.game_loop import GameLoop
    from gameserver.game_server import GameServer
    gameserver_l = GameServer(map_size=20)
    game_loop_l = GameLoop(gameserver_l)


    gameserver_l.min_tiles_viewport_rect_size = 3
    gameserver_l.viewport_edge_chunk_size = 2
    gameserver_l.updates_viewport_rect_size = gameserver_l.min_tiles_viewport_rect_size + gameserver_l.viewport_edge_chunk_size


    return gameserver_l, game_loop_l


gameserver, game_loop = start_game_server()


def ready_packet_actions(client, player, spawn_position=Vector(10, 10), direction=Direction.UP):
    from gameserver.network.packets import ReadyPacket
    ready = ReadyPacket()
    ready.map_size = client.game_server.map.map_size
    ready.user_id = client.player.player_id
    ready.player_name = client.player.name

    client.game_server.add_new_player(client.player)

    # Set Player Position
    position, direction = spawn_position, str(direction)
    client.player.position = position.clone()
    client.player.start_position = position.clone()
    client.player.direction = direction
    client.player.last_edge_check_position = position.clone()

    ready.player_x = client.player.position.x
    ready.player_y = client.player.position.y
    ready.player_direction = client.player.direction

    client.player.generate_player_colors()

    ready.color_brighter = client.player.color_brighter
    ready.color_darker = client.player.color_darker
    ready.color_slightlyBrighter = client.player.color_slightlyBrighter
    ready.color_pattern = client.player.color_pattern
    ready.color_patternEdge = client.player.color_patternEdge

    client.player.on_change_position()
    client.player.join_time = time.time()
    blocks_rect = client.game_server.map.fill_new_player_blocks(client.player)
    client.game_server.map.players_captured_blocks.add_player(client.player, blocks_rect)
    client.game_server.broadcast_player_state(client.player)
    client.player.send_player_viewport()

    client.player.is_send_ready_packet = True


def add_mock_player(name="Mock Player"):
    from gameserver.client import GameClient

    from gameserver.game.player import Player

    client = GameClient(None, gameserver, is_mock=True)
    client.player = Player(gameserver, client, name)
    client.player.player_id = gameserver.generate_random_id()

    player_id = client.player.player_id

    ready_packet_actions(client, client.player)

    def stop_render_func():
        if game_loop.frames_rendered_from_game_start >= 35:
            return True
        return False

    game_loop.stop_render_based_on_function = stop_render_func
    game_loop.start()

    player = gameserver.get_player_by_id(player_id)
    start_position = player.position.clone()
    map = gameserver.map

    print(f"Player Viewport: {player.get_viewport()} , Player Position: {player.position}")
    while game_loop.is_running:
        time.sleep(.05)

    print(f"Player Viewport: {player.get_viewport()} , Player Position: {player.position}")

    direction_packet = DirectionPacket()
    direction_packet.dir = player.get_random_direction_but_not_opposite()
    direction_packet.dir = "right"
    direction_packet.position = player.position.clone()
    old_direction = player.direction

    direction_packet.handle_packet(client)
    time.sleep(1)
    print("Player Position: ", player.position, "Direction: ", direction_packet.dir, "Old Direction: ", old_direction)

    map.draw_map_as_text()
    print(f"Starting Position: {start_position} , ending position: {player.position} , direction: {player.direction}")


def mocking():
    gameserver.min_tiles_viewport_rect_size = 3
    gameserver.viewport_edge_chunk_size = 2
    gameserver.updates_viewport_rect_size = gameserver.min_tiles_viewport_rect_size + gameserver.viewport_edge_chunk_size

    start_time = time.time()


    player = add_player_with_client("Mock Player",direction=Direction.DOWN,position=Vector(14,4))
    start_position = player.position.clone()
    player2 = add_player_with_client("King",Vector(7,10),Direction.RIGHT)

    game_map = gameserver.map
    def on_frame_render(frame):
        player_2_position = player2.position
        if player_2_position == Vector(15,10):
            direction_packet = DirectionPacket()
            direction_packet.dir = "up"
            direction_packet.position = player2.position.clone()
            direction_packet.handle_packet(player2.client)

        elif player_2_position == Vector(15,4):
            direction_packet = DirectionPacket()
            direction_packet.dir = "left"
            direction_packet.position = player2.position.clone()
            direction_packet.handle_packet(player2.client)


        elif player_2_position == Vector(7,4):
            direction_packet = DirectionPacket()
            direction_packet.dir = "down"
            direction_packet.position = player2.position.clone()
            direction_packet.handle_packet(player2.client)

    start_game_loop_with_on_frame_render(max_frames_to_stop= 44,on_render_frame=on_frame_render)

    end_time = time.time()
    print(f"Time Taken: {end_time - start_time}")

    print(f"Player Position: {player.position}, Start Position: {start_position}, {player.next_tile_progress} , Direction {player.direction}")
    # game_map.draw_map_as_text_with_players_positions()
    # for i in gameserver.get_overlapping_players_with_rec(player.waiting_bounds):
    #     print(i.name)

    game_map.draw_map_as_text_with_players_positions()
    print(f"Player Killer Total Blocks: {player2.total_physical_blocks}")
    print(f"Player Killer Total Blocks: {player.total_physical_blocks}")
    #


def add_player_with_client(name,position=Vector(10,10),direction=Direction.RIGHT):
    from gameserver.client import GameClient
    from gameserver.game.player import Player

    client = GameClient(None, gameserver, is_mock=True)
    client.player = Player(gameserver, client, name)
    client.player.player_id = gameserver.generate_random_id()
    player_id = client.player.player_id
    ready_packet_actions(client, client.player,position,direction)
    player = gameserver.get_player_by_id(player_id)
    return player


def wait_till_game_loop_finish():
    while game_loop.is_running:
        sleep(.03)

@logTime
def start_game_loop(max_frames_to_stop=35,wait=True):
    def stop_render_func():
        if game_loop.frames_rendered_from_game_start >= max_frames_to_stop:
            return True
        return False

    game_loop.stop_render_based_on_function = stop_render_func
    game_loop.start()
    if wait:
        wait_till_game_loop_finish()




@logTime
def start_game_loop_with_on_frame_render(max_frames_to_stop=35,on_render_frame=None,wait=True):
    def stop_render_func():
        if game_loop.frames_rendered_from_game_start >= max_frames_to_stop:
            return True
        return False

    game_loop.stop_render_based_on_function = stop_render_func
    game_loop.on_render_frame = on_render_frame
    game_loop.start()
    if wait:
        wait_till_game_loop_finish()



mocking()

