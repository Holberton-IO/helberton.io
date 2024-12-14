import time
from enum import Enum
from gameserver.game.vector import Vector


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


def add_player_with_client(
        gameserver,name,position=Vector(10,10),direction=Direction.RIGHT
                           ):
    from gameserver.client import GameClient
    from gameserver.game.player import Player

    client = GameClient(None, gameserver, is_mock=True)
    client.player = Player(gameserver, client, name)
    client.player.player_id = gameserver.generate_random_id()
    player_id = client.player.player_id
    ready_packet_actions(client, client.player,position,direction)
    player = gameserver.get_player_by_id(player_id)
    return player



def start_game_server():
    from gameserver.game_loop import GameLoop
    from gameserver.game_server import GameServer
    gameserver_l = GameServer(map_size=20)
    game_loop_l = GameLoop(gameserver_l)


    gameserver_l.min_tiles_viewport_rect_size = 3
    gameserver_l.viewport_edge_chunk_size = 2
    gameserver_l.updates_viewport_rect_size = gameserver_l.min_tiles_viewport_rect_size + gameserver_l.viewport_edge_chunk_size


    return gameserver_l, game_loop_l