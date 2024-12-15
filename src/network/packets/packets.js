import NamePacket from "./namePacket";
import Ready from "./ready";
import FillAreaPacket from "./fillArea";
import PlayerStatePacket from "./playerState";
import WaitingBlocksPacket from "./waitingBlocks";
import DirectionPacket from "./direction";
import PingPacket from "./ping";
import PongPacket from "./pong";
import RequestWaitingBlockPacket from "./requestWaitingBlocks";
import PlayerRemovedPacket from "./playerRemoved";
import StopDrawingWaitingBlocksPacket from "./stopDrawingWaitingBlocks";
import ConnectAsViewerPacket from "./connectAsViewerPacket";
import UpdateLeaderBoardPacket from "./updateLeaderBoard";
import KilledPlayerPacket from "./killedPlayer";
import RespawnPacket from "./respawn";

const PacketsDictionary = {
    1001: NamePacket,
    1004: PlayerStatePacket,
    1002: Ready,
    1003: FillAreaPacket,
    1005: WaitingBlocksPacket,
    1006: DirectionPacket,
    1007: PingPacket,
    1008: PongPacket,
    1009: RequestWaitingBlockPacket,
    1010: PlayerRemovedPacket,
    1011: StopDrawingWaitingBlocksPacket,
    1012: ConnectAsViewerPacket,
    1013: UpdateLeaderBoardPacket,
    1014: KilledPlayerPacket,
    1015: RespawnPacket, // We Be Receive As Ready Packet
}


export default PacketsDictionary;