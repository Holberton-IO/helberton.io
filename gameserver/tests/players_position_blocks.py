import time
from time import sleep
from gameserver.game.vector import Vector
from gameserver.network.packets import DirectionPacket
from gameserver.tests.helpers import start_game_server
from gameserver.tests.helpers import add_player_with_client, Direction, logTime

"""
   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 
 0 X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  
 1 X  O  O  O  O  O  O  O  O  O  O  O  O  O  O  O  O  O  O  X  
 2 X  O  O  O  O  O  O  O  O  O  O  O  O  O  O  O  O  O  O  X  
 3 X  2  2  2  2  2  2  2  2  O  O  O  O  O  O  O  O  O  O  X  # Player 2 View Port
 4 X  O  O  O  O  O  O  O  2  O  O  O  O  O  O  O  O  O  O  X  
 5 X  O  O  O  O  O  O  O  2  O  O  O  O  O  O  O  O  O  O  X  
 6 X  2  2  2  2  2  O  O  2  O  O  O  O  O  O  O  O  O  O  X  
 7 X  2  2  2  2  2  O  O  2  O  O  O  O  3  3  3  3  3  3  X  # View Port
 8 X  2  2  2  2  2  2  2  2  2  2  2  2  3  O  O  O  O  O  X  
 9 X  2  2  2  2  2  2  2  2  2  2  2  2  3  O  O  O  O  O  X  
10 X  2  2  2  2  2  2  2  2  2  2  2  2  3  3  3  O  O  O  X  
11 X  O  O  2  2  2  2  2  2  2  2  2  2  3  3  3  O  O  O  X  
12 X  O  O  2  2  2  2  2  2  2  2  2  2  3  3  3  3  3  3  X  # Waiting Blocks
13 X  2  2  2  2  2  2  2  2  2  2  2  2  3  3  3  O  O  O  X  
14 X  O  O  O  O  O  O  O  O  O  O  3  3  3  3  3  O  O  O  X  
15 X  O  O  O  O  O  O  O  O  O  O  O  O  3  O  O  O  O  O  X  
16 X  O  O  O  O  O  O  O  O  O  O  O  O  3  O  O  O  O  O  X  
17 X  O  O  O  O  O  O  O  O  O  O  O  O  3  3  3  3  3  3  X   View Port
18 X  O  O  O  O  O  O  O  O  O  O  O  O  O  O  O  O  O  O  X  
19 X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  
Player Killer Total Blocks: 76 , 23.456790123456788
Player Killer Total Blocks: 17,  5.246913580246913

"""



gameserver, game_loop = start_game_server()
def mocking():
    start_time = time.time()



    player2 = add_player_with_client(gameserver,"King",Vector(3,8),Direction.RIGHT)
    player1 = add_player_with_client(gameserver,"Test",Vector(13,12),Direction.RIGHT)

    game_map = gameserver.map
    def on_frame_render(frame):
        player_2_position = player2.position
        if player_2_position == Vector(12,8) and player2.direction != 'down':
            direction_packet = DirectionPacket()
            direction_packet.dir = 'down'
            direction_packet.position = player_2_position.clone()
            direction_packet.handle_packet(player2.client)


        if player_2_position == Vector(12,13) and player2.direction != 'left':
            direction_packet = DirectionPacket()
            direction_packet.dir = 'left'
            direction_packet.position = player_2_position.clone()
            direction_packet.handle_packet(player2.client)


        if player_2_position == Vector(3,13) and player2.direction != 'up':
            direction_packet = DirectionPacket()
            direction_packet.dir = 'up'
            direction_packet.position = player_2_position.clone()
            direction_packet.handle_packet(player2.client)

    start_game_loop_with_on_frame_render(game_loop,max_frames_to_stop= 95,on_render_frame=on_frame_render)

    end_time = time.time()
    print(f"Time Taken: {end_time - start_time}")



    game_map.draw_map_as_text_with_players_positions()
    print(f"Player Killer Total Blocks: {player2.total_physical_blocks} , {player2.occupied_percentage} ,{player2.name}")
    print(f"Player Killer Total Blocks: {player1.total_physical_blocks},  {player1.occupied_percentage} ,{player1.name}")
    print(gameserver.sort_players_by_blocks())



def wait_till_game_loop_finish(game_loop):
    while game_loop.is_running:
        sleep(.03)


@logTime
def start_game_loop_with_on_frame_render(game_loop,max_frames_to_stop=35,on_render_frame=None,wait=True):
    def stop_render_func():
        if game_loop.frames_rendered_from_game_start >= max_frames_to_stop:
            return True
        return False

    game_loop.stop_render_based_on_function = stop_render_func
    game_loop.on_render_frame = on_render_frame
    game_loop.start()
    if wait:
        wait_till_game_loop_finish(game_loop)



mocking()
