import time

from gameserver.game.leader_board import LeaderBoard
from gameserver.network.utils.writer import Writer

writer = Writer(1013)
writer.write_float_in_bytes(25.00,4)
print(writer.to_hex_string())