from typing import Optional, TYPE_CHECKING
from gameserver.game.rect import Rectangle


if TYPE_CHECKING:
    from gameserver.game.vector import Vector

class HObject:
    def __init__(self, game_server, game_client, ob_id, name=""):
        self.id = ob_id
        self.name = name
        self.position: Optional['Vector'] = None
        self.game = game_server
        self.client = game_client

        # Players | Objects
        self.players_in_viewport = set()
        self.other_players_in_viewport = set()
        self.is_alive = False
        self.is_removed_from_game = False
        self.waiting_bounds = None

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
            self.game.map.notify_blocks_filled(cmp_block[0], cmp_block[1])

    def loop(self, tick, dt, game_server):
        pass

    def on_removed(self):
        pass

    @property
    def is_dead(self):
        return not self.is_alive

    def add_player_to_viewport(self, player):
        import gameserver.network.packets as packets
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
        waiting_blocks_packet = packets.WaitingBlocksPacket(player)
        self.client.send(waiting_blocks_packet)

    ################## View Port ########################


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


        # If Viewer Watching The Board
        if self.waiting_bounds is None:
            return


        for player in self.game.get_overlapping_players_with_rec(self.waiting_bounds):
            left_players.discard(player)
            player.add_player_to_viewport(self)

        for player in left_players:
            player.remove_player_from_viewport(self)
