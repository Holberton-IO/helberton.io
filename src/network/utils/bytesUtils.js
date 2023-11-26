const intToBytes = (value, byteorder = 'little', signed = false, numBytes = 4) => {
    const littleEndian = (byteorder === 'little');
    const bytes = new Uint8Array(numBytes);
    const view = new DataView(bytes.buffer);

    if (signed && value < 0) {
        // Convert negative value to 2's complement representation
        value = (1 << (8 * numBytes)) + value;
    }

    for (let i = 0; i < numBytes; i++) {
        const shift = littleEndian ? i * 8 : (numBytes - 1 - i) * 8;
        view.setUint8(i, (value >> shift) & 0xFF);
    }

    return bytes;
}
const bytesToInt = (bytes, byteorder = 'little', signed = false) => {
    const view = new DataView(bytes.buffer);
    const littleEndian = (byteorder === 'little');

    if (bytes.length <= 0 || bytes.length > 8) {
        throw new Error('Unsupported number of bytes');
    }
    let value = 0;

    for (let i = 0; i < bytes.length; i++) {
        const shift = littleEndian ? i * 8 : (bytes.length - 1 - i) * 8;
        value |= view.getUint8(i) << shift;
    }
    if (signed) {
        const signBit = 1 << (8 * bytes.length - 1);
        if (value & signBit) {
            value = value - (signBit << 1);
        }
    }
    return value;
}


const toHexString = (data) => {
    return Array.from(data)
        .map(byte => '0x' + byte.toString(16).padStart(2, '0'))
        .join(' ');
}

export {intToBytes, bytesToInt,toHexString};