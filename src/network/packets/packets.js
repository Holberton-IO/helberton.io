import NamePacket from "./namePacket";
import Ready from "./ready";
import FillAreaPacket from "./fillArea";

const PacketsDictionary = {
    1001: NamePacket,
    1002: Ready,
    1003: FillAreaPacket,
}





export default PacketsDictionary;