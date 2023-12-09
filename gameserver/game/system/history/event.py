import dataclasses
from enum import Enum
from datetime import datetime

from gameserver.game.vector import Vector


class EventType(Enum):
    StartWaiting = 1


@dataclasses.dataclass
class Event:
    """Game Events"""
    event: EventType
    position: Vector
    time: datetime = datetime.now()

    @property
    def time_difference(self):
        return datetime.now() - self.time
