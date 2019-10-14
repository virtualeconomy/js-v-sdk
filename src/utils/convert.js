"use strict";
// Derived from waves-api
//
// Object.defineProperty(exports, "__esModule", { value: true });
import bignumber_1 from 'bignumber.js';
import converters_1 from './converters';
import Base58 from 'base-58';
function performBitwiseAnd(a, b) {
    let sa = a.toString(2).split('.')[0];
    let sb = b.toString(2).split('.')[0];
    let len = Math.min(sa.length, sb.length);
    let s1 = sa.slice(sa.length - len);
    let s2 = sb.slice(sb.length - len);
    let result = new Array(len);
    for (let i = len - 1; i >= 0; i--) {
        result[i] = (s1[i] === '1' && s2[i] === '1') ? '1' : '0';
    }
    return parseInt(result.join(''), 2);
}
function parseAmountData(bytes, bytes_length) {
    let result = ''
    for (let k = 0; k < bytes_length; k++) {
        let len = 8 - bytes[k].toString(2).length
        result += '0'.repeat(len) + bytes[k].toString(2)
    }
    return bytes_length === 8 ? bignumber_1.default(result, 2) : bignumber_1.default(result, 2).toNumber()
}
const Convert = {
    booleanToBytes: function (input) {
        if (typeof input !== 'boolean') {
            throw new Error('Boolean input is expected');
        }
        return input ? [1] : [0];
    },
    bytesToByteArrayWithSize: function (input) {
        if (!(input instanceof Array || input instanceof Uint8Array)) {
            throw new Error('Byte array or Uint8Array input is expected');
        }
        else if (input instanceof Array && !(input.every(function (n) { return typeof n === 'number'; }))) {
            throw new Error('Byte array contains non-numeric elements');
        }
        if (!(input instanceof Array)) {
            input = Array.prototype.slice.call(input);
        }
        let lengthBytes = converters_1.int16ToBytes(input.length, true);
        return lengthBytes.concat(input);
    },
    shortToByteArray: function (input) {
        if (typeof input !== 'number') {
            throw new Error('Numeric input is expected');
        }
        return converters_1.int16ToBytes(input, true);
    },
    longToByteArray: function (input) {
        if (typeof input !== 'number') {
            throw new Error('Numeric input is expected');
        }
        let bytes = new Array(7);
        for (let k = 7; k >= 0; k--) {
            bytes[k] = input & (255);
            input = input / 256;
        }
        return bytes;
    },
    idxToByteArray: function (input) {
        return converters_1.int32ToBytes(input, true);
    },
    bigNumberToByteArray: function (input) {
        if (!(input instanceof bignumber_1.default)) {
            throw new Error('BigNumber input is expected');
        }
        let performBitwiseAnd255 = performBitwiseAnd.bind(null, new bignumber_1.default(255));
        let bytes = new Array(7);
        for (let k = 7; k >= 0; k--) {
            bytes[k] = performBitwiseAnd255(input);
            input = input.div(256);
        }
        return bytes;
    },
    parseFunctionData: function (base_string) {
        let bytes = Base58.decode(base_string)
        let parameters_num = bytes[1]
        bytes = bytes.slice(2)
        let function_data = []
        for (let i = 0; i < parameters_num; i++) {
            let type = bytes[0]
            if (type === 1) {
                function_data.push(Base58.encode(bytes.slice(1, 33)))
                bytes = bytes.slice(33)
            } else if (type === 2 || type === 6 || type === 7) {
                function_data.push(Base58.encode(bytes.slice(1, 27)))
                bytes = bytes.slice(27)
            } else if (type === 3) {
                function_data.push(parseAmountData(bytes.slice(1, 9), 8))
                bytes = bytes.slice(9)
            } else if (type === 4) {
                function_data.push(parseAmountData(bytes.slice(1, 5), 4))
                bytes = bytes.slice(5)
            } else if (type === 5) {
                let short_text_length = bytes[2]
                function_data.push(converters_1.byteArrayToString(bytes.slice(3, short_text_length + 3)))
                bytes = bytes.slice(short_text_length + 3)
            } else {
                throw new Error('Wrong parameter type')
            }
        }
        return function_data
    },
    stringToByteArray: function (input) {
        if (typeof input !== 'string') {
            throw new Error('String input is expected');
        }
        return converters_1.stringToByteArray(input);
    },
    stringToByteArrayWithSize: function (input) {
        if (typeof input !== 'string') {
            throw new Error('String input is expected');
        }
        let stringBytes = converters_1.stringToByteArray(input);
        let lengthBytes = converters_1.int16ToBytes(stringBytes.length, true);
        return lengthBytes.concat(stringBytes);
    }
};

export default Convert;
//# sourceMappingURL=convert.js.map
