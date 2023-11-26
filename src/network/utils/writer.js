import {intToBytes, bytesToInt, toHexString} from './bytesUtils.js';

class Writer {
    // Infinity
    constructor(packetId = -1) {
        this.packetSize = 20;
        this.packetId = packetId;

        this.data = new Uint8Array(this.packetSize);
        this.position = 0;
        this.setPacketId();
    }

    setPacketId() {
        this.position = 2;
        this.writeIntInBytes(this.packetId);
        this.updatePacketSize()

    }

    updatePacketSize() {
        this.packetSize = this.position;
        const currentOffset = this.position;
        this.position = 0;
        const b = intToBytes(this.packetSize, 'little', false, 2);
        this.data.set(b, this.position);
        this.position = currentOffset;
    }

    writeIntInBytes(number, bytesNumber = 2) {
        let bytes = intToBytes(number, 'little', false, bytesNumber);
        this.ensureCapacity(bytesNumber);
        this.data.set(bytes, this.position);
        this.position += bytesNumber;
        this.updatePacketSize();
    }


    writeStringInBytes(string) {
        let stringLength = string.length;
        this.writeIntInBytes(stringLength, 2);
        let bytes = new TextEncoder().encode(string);
        this.ensureCapacity(stringLength);
        this.data.set(bytes, this.position);
        this.position += stringLength;
        this.updatePacketSize();
    }

    ensureCapacity(requiredSize) {

        if (this.position + requiredSize > this.data.length) {
            const newSize = requiredSize + (this.data.length) * 2;
            const newData = new Uint8Array(newSize);
            newData.set(this.data);
            this.data = newData;
        }

    }

    finalize() {
        return this.data.slice(0, this.position);
    }

    toHexString() {
        return toHexString(this.finalize());
    }


}

export default Writer;