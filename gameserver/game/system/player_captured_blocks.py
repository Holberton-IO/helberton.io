from gameserver.game.rect import Rectangle
from gameserver.game.vector import Vector
from gameserver.game.player import Player


class PlayerCapturedBlocks:
    def __init__(self):
        self.players: dict[int, Rectangle] = {}

    def add_player(self, player: Player, blocks_rect: Rectangle):
        if player.player_id in self.players:
            raise Exception("Player Already Added")
        self.players[player.player_id] = blocks_rect.clone()

    def remove_player(self, player: Player):
        if player.player_id in self.players:
            del self.players[player.player_id]

    def get_player_blocks(self, player: Player) -> Rectangle:
        if player.player_id in self.players:
            return self.players[player.player_id].clone()
        raise Exception("Player Not Found")

    def expand_player_blocks_rec(self, player: Player, rect: Rectangle):
        if player.player_id not in self.players:
            raise Exception("Player Not Found")
        self.players[player.player_id].expand_to_rect(rect)

    def expand_player_blocks_vec(self, player: Player, vector: Vector):
        if player.player_id not in self.players:
            raise Exception("Player Not Found")
        rect = Rectangle(vector.clone(), vector.clone().add_scalar(1))
        self.expand_player_blocks_rec(player, rect)

    def update_player_blocks(self, player: Player, rect: Rectangle):
        if player.player_id not in self.players:
            raise Exception("Player Not Found")
        self.players[player.player_id] = rect.clone()
