from gameserver.game.system.history.event import Event
from gameserver.game.vector import Vector
from gameserver.game.rect import Rectangle
from gameserver.game_server import GameServer


class PlayerEventHistory:
    """Player event history class."""

    def __init__(self, player):
        self.player = player
        self.events = []
        self.on_undo_event = None

    def add_event(self, event: Event):
        """Add event to history."""
        self.events.append(event)

    def get_allowed_red(self, previous_pos, new_pos):
        allowed_rect = Rectangle(Vector(0, 0), Vector(0, 0))
        if previous_pos == new_pos:
            allowed_rect = Rectangle(previous_pos, previous_pos)
        elif previous_pos.x == new_pos.x:
            if previous_pos.y < new_pos.y:
                allowed_rect.min = previous_pos
                allowed_rect.max = Vector(new_pos.x + 1, new_pos.y)
            else:
                allowed_rect.min = Vector(new_pos.x, new_pos.y + 1)
                allowed_rect.max = Vector(previous_pos.x + 1, previous_pos.y + 1)
        elif previous_pos.y == new_pos.y:
            if previous_pos.x < new_pos.x:
                allowed_rect.min = previous_pos
                allowed_rect.max = Vector(new_pos.x, new_pos.y + 1)
            else:
                allowed_rect.min = Vector(new_pos.x + 1, new_pos.y)
                allowed_rect.max = Vector(previous_pos.x + 1, previous_pos.y + 1)
        else:
            raise Exception("Invalid event")
        return allowed_rect

    def undo_event(self, previous_pos, new_pos):
        """Undo event."""
        allowed_rect = self.get_allowed_red(previous_pos, new_pos)
        max_time_to_undo = GameServer.max_undo_event_time
        while True:
            event = self.events.pop()
            if not event:
                break

            if event.time_difference > max_time_to_undo:
                break

            if allowed_rect.vector_in_rect(event.position):
                self.on_undo_event(event)

        self.events = []
