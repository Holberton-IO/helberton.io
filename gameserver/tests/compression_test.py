from gevent.libev.corecext import callback

from gameserver.client import GameClient
from gameserver.game.map import Map
from gameserver.game.player import Player
from gameserver.game.rect import Rectangle, RectangleBuilder
from gameserver.game.vector import Vector
from gameserver.game_server import GameServer


def transposed(matrix):
    return list(map(list, zip(*matrix)))

def prepare_call_back(mask,blocks,player):
    def call_back(cx, cy):
        if mask[cx][cy] == 0 and blocks[cx][cy] != player:
            return player
        return None
    return call_back


def init():
    gameserver = GameServer(map_size=20)
    game_map = gameserver.map
    game_map.create_blocks()
    ##################################
    client = GameClient(None, gameserver, is_mock=True)
    player = Player(gameserver, client, "Mock Player")
    player_id = gameserver.generate_random_id()
    client.player = player
    client.player.player_id = player_id


    ##########################
    rec = RectangleBuilder(
        Vector(15,2),
        Vector(17, 5)
    ).build()

    game_map.fill_blocks(rec, player)
    game_map.players_captured_blocks.add_player(player, rec)

    rec = RectangleBuilder(
        Vector(3,3),
        Vector(15, 3)
    ).build()
    game_map.fill_blocks(rec, player)
    game_map.players_captured_blocks.expand_player_blocks_rec(player, rec)

    rec = RectangleBuilder(
        Vector(3, 3),
        Vector(3, 10)
    ).build()
    game_map.fill_blocks(rec, player)
    game_map.players_captured_blocks.expand_player_blocks_rec(player, rec)

    rec = RectangleBuilder(
        Vector(2, 10),
        Vector(5, 14)
    ).build()
    game_map.fill_blocks(rec, player)
    game_map.players_captured_blocks.expand_player_blocks_rec(player, rec)

    rec = RectangleBuilder(
        Vector(6, 12),
        Vector(16, 12)
    ).build()
    game_map.fill_blocks(rec, player)
    game_map.players_captured_blocks.expand_player_blocks_rec(player, rec)



    rec = RectangleBuilder(
        Vector(16, 12),
        Vector(16, 5)
    ).build()
    game_map.fill_blocks(rec, player)
    game_map.players_captured_blocks.expand_player_blocks_rec(player, rec)


    print(game_map.players_captured_blocks.get_player_blocks(player))

    compressed_blocks,new_rect = game_map.update_captured_area(player,[])
    #print(compressed_blocks)
    print(new_rect)
    # call_back = prepare_call_back()
    print("Now --------------------------")
    cmp = game_map.take_player_blocks(player,player)
    print(cmp)


    game_map.draw_map_as_text_with_players_positions()



init()


# <Rectangle min=<Vector x=5 y=8> max=<Vector x=18 y=14>>
# [{'rect': <Rectangle min=<Vector x=6 y=9> max=<Vector x=12 y=12>>, 'data': <Player name=Mock Player id=2>}]
# <Rectangle min=<Vector x=5 y=8> max=<Vector x=18 y=14>>