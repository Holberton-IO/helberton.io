import NamePacket from "./namePacket";
import Ready from "./ready";
import FillAreaPacket from "./fillArea";
import PlayerStatePacket from "./playerState";
import WaitingBlocksPacket from "./waitingBlocks";

const PacketsDictionary = {
    1001: NamePacket,
    1002: Ready,
    1003: FillAreaPacket,
    1004: PlayerStatePacket,
    1005: WaitingBlocksPacket
}





export default PacketsDictionary;