from gameserver.network.packets.direction import DirectionPacket
from gameserver.network.packets.name import NamePacket
from gameserver.network.packets.ping import PingPacket
from gameserver.network.packets.player_removed import PlayerRemovedPacket
from gameserver.network.packets.ready import ReadyPacket
from gameserver.network.packets.fill_area import FillAreaPacket
from gameserver.network.packets.player_state import PlayerStatePacket
from gameserver.network.packets.waiting_blocks import WaitingBlocksPacket
from gameserver.network.packets.request_waiting_block import RequestWaitingBlocks

dic = {
    1001: NamePacket,
    1002: ReadyPacket,
    1003: FillAreaPacket,
    1004: PlayerStatePacket,
    1005: WaitingBlocksPacket,
    1006: DirectionPacket,
    1007: PingPacket,
    1008: None,  # Pong Packet
    1009: RequestWaitingBlocks,
    1010: PlayerRemovedPacket,
}
