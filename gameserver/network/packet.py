from abc import abstractmethod, ABC


class Packet(ABC):
    def __init__(self):
        self.data = bytearray()
        self.packet_id = 0
        self.packet_size = 0
        self.reader = None

    @abstractmethod
    def finalize(self):
        pass

    def to_hex(self):
        return self.reader.to_hex_string()

    @staticmethod
    def parse_packet(packet):
        raise NotImplementedError

    @staticmethod
    def parse_packet_data(packet_size, reader, packet):
        p = packet()
        p.reader = reader
        p.buffer = reader.buffer
        p.packet_size = packet_size
        return p.parse_packet(p)

    def handle_packet(self,packet, client):
        raise NotImplementedError
