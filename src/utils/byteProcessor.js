import BigNumber from 'bignumber.js';
import B58 from 'base-58';
import Convert from './convert';

// ABSTRACT PARENT
class ByteProcessor {
    constructor(name) {
        this.name = name;
    }
}

class Base58 extends ByteProcessor {
    process(value) {
        return B58.decode(value);
    }
}

class Short extends ByteProcessor {
    process(value) {
        const bytes = Convert.shortToByteArray(value);
        return Uint8Array.from(bytes);
    }
}

class Int extends ByteProcessor {
    process(value) {
        const bytes = Convert.idxToByteArray(value);
        return Uint8Array.from(bytes);
    }
}

class Long extends ByteProcessor {
    process(value) {
        const bv = new BigNumber(value);
        const bytes = Convert.bigNumberToByteArray(bv);
        return Uint8Array.from(bytes);
    }
}

class Attachment extends ByteProcessor {
    process(value) {
        if (typeof value === 'string') {
            value = Uint8Array.from(Convert.stringToByteArray(value));
        }
        const valueWithLength = Convert.bytesToByteArrayWithSize(value);
        return Uint8Array.from(valueWithLength);
    }
}

class Recipient extends ByteProcessor {
    process(value) {
        const addressBytes = B58.decode(value);
        return Uint8Array.from(addressBytes);
    }
}

class Base58WithSize extends ByteProcessor {
    process(value) {
        let dataBytes = B58.decode(value);
        dataBytes = Convert.bytesToByteArrayWithSize(dataBytes)
        return Uint8Array.from(dataBytes);
    }
}

class DataEntry extends Base58WithSize {}

class Contract extends Base58WithSize {}

export default { ByteProcessor, Base58, Short, Long, Attachment, Recipient, DataEntry, Contract, Int };
