from gameserver.network.utils.writer import Writer
from gameserver.network.utils.reader import Reader
from gameserver.network.packets import dic
from gameserver.client import GameClient


class Socket:
    def __init__(self, sock, game_server):
        self.sock = sock
        self.is_alive = True
        self.client = None
        self.game_server = game_server

    def on_receive(self, data):
        r = Reader(data)
        packet_size = r.read_int_2()
        packet_id = r.read_int_2()
        cls = dic[packet_id]
        p = cls.parse_packet_data(packet_size, r, cls)
        p.handle_packet(p, self.client)

    def on_connect(self):
        self.client = GameClient(self, self.game_server)
        self.game_server.add_new_client(self.client)
        self.wait_to_receive()

    def wait_to_receive(self):
        try:
            while self.is_alive:
                data = self.sock.receive()

                if type(data) == str:
                    continue

                self.on_receive(data)
        except Exception as e:
            print(e)
        finally:
            self.close()
            print("Connection closed")

    def send(self, data):
        print("Sending", data)
        self.sock.send(data)

    def close(self):
        self.is_alive = False
        self.game_server.remove_client(self.client)
