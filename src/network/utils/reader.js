import {intToBytes, bytesToInt, toHexString} from './bytes-utils.js';


class Reader {
    constructor(data) {
        this.data = data;
        this.position = 0;
    }

    readIntFromBytes(bytesNumber = 2) {
        const bytes = this.data.slice(this.position, this.position + bytesNumber);
        this.position += bytesNumber;
        return bytesToInt(bytes, 'little', false);
    }

    readStringFromBytes(stringLength) {
        const bytes = this.data.slice(this.position, this.position + stringLength);
        this.position += stringLength;
        return new TextDecoder().decode(bytes);
    }

    readFloatFromBytes(bytesNumber = 4) {
        const bytes = this.data.slice(this.position, this.position + bytesNumber);
        this.position += bytesNumber;
        const buffer = new ArrayBuffer(bytesNumber);
        new Uint8Array(buffer).set(bytes);
        const view = new DataView(buffer);
        if (bytesNumber === 4) {
            return view.getFloat32(0, true);
        }
        if (bytesNumber === 8) {
            return view.getFloat64(0, true);
        }
        throw new Error('Unsupported number of bytes for float');
    }

    readString() {
        const stringLength = this.readInt2();
        return this.readStringFromBytes(stringLength);
    }


    readInt1() {
        return this.readIntFromBytes(1);
    }
    readInt4() {
        return this.readIntFromBytes(4);
    }
    readInt2() {
        return this.readIntFromBytes(2);
    }
    readInt8() {
        return this.readIntFromBytes(8);
    }
    readInt16() {
        return this.readIntFromBytes(16);
    }
    readInt32() {
        return this.readIntFromBytes(32);
    }


    toHexString()
    {
        return toHexString(this.data);
    }

}

export default Reader;