from gameserver.network.packets.name import NamePacket
from gameserver.network.packets.ready import ReadyPacket
from gameserver.network.packets.fill_area import FillAreaPacket
from gameserver.network.packets.player_state import PlayerStatePacket

dic = {
    1001: NamePacket,
    1002: ReadyPacket,
    1003: FillAreaPacket,
    1004: PlayerStatePacket
}
