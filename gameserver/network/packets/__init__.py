from gameserver.network.packets.connect_as_viewer import ViewerConnectPacket
from gameserver.network.packets.direction import DirectionPacket
from gameserver.network.packets.name import NamePacket
from gameserver.network.packets.ping import PingPacket
from gameserver.network.packets.player_killed import KilledPlayerPacket
from gameserver.network.packets.player_removed import PlayerRemovedPacket
from gameserver.network.packets.ready import ReadyPacket
from gameserver.network.packets.fill_area import FillAreaPacket
from gameserver.network.packets.player_state import PlayerStatePacket
from gameserver.network.packets.respawn import RespawnPacket
from gameserver.network.packets.update_leader_board import UpdateLeaderBoardPacket
from gameserver.network.packets.waiting_blocks import WaitingBlocksPacket
from gameserver.network.packets.request_waiting_block import RequestWaitingBlocks

dic = {
    NamePacket.PACKET_ID: NamePacket,
    ReadyPacket.PACKET_ID: ReadyPacket,
    FillAreaPacket.PACKET_ID: FillAreaPacket,
    PlayerStatePacket.PACKET_ID: PlayerStatePacket,
    WaitingBlocksPacket.PACKET_ID: WaitingBlocksPacket,
    DirectionPacket.PACKET_ID: DirectionPacket,
    PingPacket.PACKET_ID: PingPacket,
    1008: None,  # Pong Packet
    RequestWaitingBlocks.PACKET_ID: RequestWaitingBlocks,
    PlayerRemovedPacket.PACKET_ID: PlayerRemovedPacket,
    1011: None,  # Stop Drawing Packet
    ViewerConnectPacket.PACKET_ID: ViewerConnectPacket,
    UpdateLeaderBoardPacket.PACKET_ID: UpdateLeaderBoardPacket,
    KilledPlayerPacket.PACKET_ID: KilledPlayerPacket,
    RespawnPacket.PACKET_ID: RespawnPacket,
}
