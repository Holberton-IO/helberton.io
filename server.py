import json
from flask import Flask, render_template, request
from flask_cors import CORS
from flask_sock import Sock
from gameserver.game_loop import GameLoop
from gameserver.network.packets import ReadyPacket
from gameserver.network.socket import Socket
from gameserver.game_server import GameServer

app = Flask(__name__)
sock = Sock()
CORS(app)
sock.init_app(app)
gameserver = GameServer(map_size=25)
game_loop = GameLoop(gameserver)
game_loop.start()

@app.route('/')
def index():
    return render_template('index.html')


@sock.route('/game')
def game_server(ws):
    s = Socket(ws, gameserver)
    s.on_connect()




@app.route('/add_player')
def add():
    add_mock_player()

def add_mock_player():
    from gameserver.game.player import Player
    from gameserver.game.vector import Vector
    from gameserver.client import GameClient

    client = GameClient(None, gameserver, is_mock=True)
    client.player = Player(gameserver, client, "Mock Player")
    client.player.player_id = gameserver.generate_random_id()
    ReadyPacket().handle_packet(client)








if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

