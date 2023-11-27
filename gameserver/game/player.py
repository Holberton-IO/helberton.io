from gameserver.utils.colors import Colors
from gameserver.utils.game_math import *
from gameserver.game.vector import Vector
from gameserver.game.rect import Rectangle


class Player:
    def __init__(self, game_server, client, name="", player_id=""):
        self.game = game_server
        self.client = client

        self.name = name
        self.player_id = player_id
        self.position = Vector(0, 0)
        self.direction = 0

        ## COLORS
        self.color_brighter = 0
        self.color_darker = 0
        self.color_slightlyBrighter = 0
        self.color_pattern = 0
        self.color_patternEdge = 0

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

    def loop(self, tick, dt, game_server):
        last_position = self.position.clone()
        self.position = self.position.get_vector_from_direction(self.direction)
        print("Player Position:", self.position)

    def update_blocks(self, game_server, vector):
        block = game_server.map.get_valid_blocks(vector)
        # if block

    def __repr__(self):
        return f"<Player name={self.name} id={self.player_id}>"

    def get_viewport(self):
        min_vec = self.position.add_scalar(-self.game.updates_viewport_rect_size)
        max_vec = self.position.add_scalar(self.game.updates_viewport_rect_size)
        return Rectangle(min_vec, max_vec)

    def get_compressed_blocks_in(self, rect):
        rect = rect.clamp(
            Rectangle(
                Vector(0, 0),
                Vector(self.game.map.map_size, self.game.map.map_size)
            )
        )
        compressed_blocks = self.game.map.compress_blocks_in(rect)
        for cmp_block in compressed_blocks:
            yield cmp_block

    def send_player_viewport(self):
        for cmp_block in self.get_compressed_blocks_in(self.get_viewport()):
            self.game.map.notify_blocks_filled(cmp_block["rect"], cmp_block["ref"])

    def __eq__(self, other):
        if isinstance(other, Player):
            return self.player_id == other.player_id
        return False
