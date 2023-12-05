import NamePacket from "./namePacket";
import Ready from "./ready";
import FillAreaPacket from "./fillArea";
import PlayerStatePacket from "./playerState";
import WaitingBlocksPacket from "./waitingBlocks";
import DirectionPacket from "./direction";
import PingPacket from "./ping";
import PongPacket from "./pong";

const PacketsDictionary = {
    1001: NamePacket,
    1004: PlayerStatePacket,
    1002: Ready,
    1003: FillAreaPacket,
    1005: WaitingBlocksPacket,
    1006: DirectionPacket,
    1007: PingPacket,
    1008: PongPacket
}


export default PacketsDictionary;