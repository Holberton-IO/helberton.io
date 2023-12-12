import json
from flask import Flask, render_template, request
from flask_cors import CORS
from flask_sock import Sock
from gameserver.game_loop import GameLoop
from gameserver.network.socket import Socket
from gameserver.game_server import GameServer

app = Flask(__name__)
sock = Sock()
CORS(app)
sock.init_app(app)
gameserver = GameServer(map_size=10)
game_loop = GameLoop(gameserver)


@app.route('/')
def index():
    return render_template('index.html')


@sock.route('/game')
def game_server(ws):
    s = Socket(ws, gameserver)
    s.on_connect()



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

