from gameserver.network.packets.update_leader_board import UpdateLeaderBoardPacket


class LeaderBoard:
    def __init__(self,game_server,number_of_players):
        self.last_update = 0
        self.update_interval = 5 # seconds
        self.number_of_players = number_of_players
        self.game_server = game_server

    def loop(self,dt , tick):
        if tick - self.last_update > self.update_interval:
            self.last_update = tick
            self.update_leaderboard()

    def update_leaderboard(self):
        self.send_leaderboard()


    def send_leaderboard(self):
        players = self.game_server.sort_players_by_blocks()[0:min(self.number_of_players,len(self.game_server.players))]
        update_packet = UpdateLeaderBoardPacket(players)
        for player in self.game_server.players:

            player.client.send(update_packet)

