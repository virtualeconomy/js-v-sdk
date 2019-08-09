"use strict";
// Derived from waves-api
//
// Object.defineProperty(exports, "__esModule", { value: true });
function nodeRandom(count, options) {
    let crypto = require('crypto');
    let buf = crypto.randomBytes(count);
    switch (options.type) {
        case 'Array':
            return [].slice.call(buf);
        case 'Buffer':
            return buf;
        case 'Uint8Array':
            let arr = new Uint8Array(count);
            for (let i = 0; i < count; ++i) {
                arr[i] = buf.readUInt8(i);
            }
            return arr;
        default:
            throw new Error(options.type + ' is unsupported.');
    }
}
function browserRandom(count, options) {
    let nativeArr = new Uint8Array(count);
    let crypto = self.crypto || self.msCrypto;
    crypto.getRandomValues(nativeArr);
    switch (options.type) {
        case 'Array':
            return [].slice.call(nativeArr);
        case 'Buffer':
            try {
                let b = new Buffer(1);
            }
            catch (e) {
                throw new Error('Buffer not supported in this environment. Use Node.js or Browserify for browser support.');
            }
            return new Buffer(nativeArr);
        case 'Uint8Array':
            return nativeArr;
        default:
            throw new Error(options.type + ' is unsupported.');
    }
}
function secureRandom(count, options) {
    options = options || { type: 'Array' };
    if (typeof window !== 'undefined' || typeof self !== 'undefined') {
        return browserRandom(count, options);
    }
    else if (typeof exports === 'object' && typeof module !== 'undefined') {
        return nodeRandom(count, options);
    }
    else {
        throw new Error('Your environment is not defined');
    }
}
exports.default = {
    secureRandom: secureRandom,
    randomArray: function (byteCount) {
        return secureRandom(byteCount, { type: 'Array' });
    },
    randomUint8Array: function (byteCount) {
        return secureRandom(byteCount, { type: 'Uint8Array' });
    },
    randomBuffer: function (byteCount) {
        return secureRandom(byteCount, { type: 'Buffer' });
    }
};
//# sourceMappingURL=secure-random.js.map
