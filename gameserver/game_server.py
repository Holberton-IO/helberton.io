class GameServer:
    __instance = None

    def __new__(cls, *args, **kwargs):
        if GameServer.__instance is None:
            map_size = kwargs.get("map_size", 0)
            GameServer.__instance = object.__new__(cls)
            GameServer.__instance.map_size = map_size

        return GameServer.__instance

    def __init__(self, **kwargs):
        self.clients = []
        self.players = []
        self.player_count = 0

    def add_new_client(self, client):
        self.clients.append(client)

    def remove_client(self, client):
        self.clients.remove(client)

    def generate_random_id(self):
        self.player_count += 1
        return self.player_count
