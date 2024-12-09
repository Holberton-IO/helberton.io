from abc import abstractmethod, ABC
from typing import Callable, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from gameserver.client import GameClient
    from gameserver.network.utils.reader import Reader


class Packet(ABC):
    PACKET_ID = 0

    def __init__(self):
        self.data = bytearray()
        self.packet_id = self.PACKET_ID
        self.packet_size = 0
        self.reader: Optional[Reader] = None

    @abstractmethod
    def finalize(self):
        pass

    def to_hex(self):
        return self.reader.to_hex_string()

    def parse_packet(self, ):
        raise NotImplementedError

    @staticmethod
    def parse_packet_data(packet_size, reader, packet: 'Callable[[],Packet]'):
        p = packet()
        p.reader = reader
        p.buffer = reader.buffer
        p.packet_size = packet_size
        p.parse_packet()
        return p

    def handle_packet(self, client: 'GameClient'):
        raise NotImplementedError
