"use strict";
// Derived from waves-api
//
Object.defineProperty(exports, "__esModule", { value: true });
import CryptoJS from 'crypto-js';
import Axlsign from 'axlsign';
import Base58 from 'base-58';
import Blake2b from 'blake2b';
import Converters from './converters';
import SecureRandom from './secure-random';
import Sha3 from 'js-sha3';
import { PRIVATE_KEY_BYTE_LENGTH, PUBLIC_KEY_BYTE_LENGTH } from '../constants';

function sha256(input) {
    let bytes;
    if (typeof input === 'string') {
        bytes = Converters.stringToByteArray(input);
    }
    else {
        bytes = input;
    }
    let wordArray = Converters.byteArrayToWordArrayEx(Uint8Array.from(bytes));
    let resultWordArray = CryptoJS.SHA256(wordArray);
    return Converters.wordArrayToByteArrayEx(resultWordArray);
}
function blake2b(input) {
    let output = new Uint8Array(32);
    Blake2b(output.length).update(input).digest(output);
    return output;
}
function keccak(input) {
    return Sha3.keccak256.array(input);
}
function hashChain(input) {
    return keccak(blake2b(input));
}
function buildSeedHash(seed, nonce) {
    let seedNonceStr = nonce.toString() + seed
    let seedBytesWithNonce = Uint8Array.from(Converters.stringToByteArray(seedNonceStr));
    let seedHash = hashChain(seedBytesWithNonce);
    return sha256(seedHash);
}
function strengthenPassword(password, rounds) {
    if (rounds === void 0) { rounds = 5000; }
    while (rounds--)
        password = Converters.byteArrayToHexString(sha256(password));
    return password;
}
exports.default = {
    sha256ForCheckSum: function (input) {
        let checkSum = Converters.byteArrayToHexString(sha256(input));
        return checkSum.slice(0, 8);
    },
    buildTransactionSignature: function (dataBytes, privateKey) {
        if (!dataBytes || !(dataBytes instanceof Uint8Array)) {
            throw new Error('Missing or invalid data');
        }
        if (!privateKey || typeof privateKey !== 'string') {
            throw new Error('Missing or invalid private key');
        }
        let privateKeyBytes = Base58.decode(privateKey);
        if (privateKeyBytes.length !== PRIVATE_KEY_BYTE_LENGTH) {
            throw new Error('Invalid private key');
        }
        let signature = Axlsign.sign(privateKeyBytes, dataBytes, SecureRandom.default.randomUint8Array(64));
        return Base58.encode(signature);
    },
    isValidTransactionSignature: function (dataBytes, signature, publicKey) {
        if (!dataBytes || !(dataBytes instanceof Uint8Array)) {
            throw new Error('Missing or invalid data');
        }
        if (!signature || typeof signature !== 'string') {
            throw new Error('Missing or invalid signature');
        }
        if (!publicKey || typeof publicKey !== 'string') {
            throw new Error('Missing or invalid public key');
        }
        let signatureBytes = Base58.decode(signature);
        let publicKeyBytes = Base58.decode(publicKey);
        if (publicKeyBytes.length !== PUBLIC_KEY_BYTE_LENGTH) {
            throw new Error('Invalid public key');
        }
        return Axlsign.verify(publicKeyBytes, dataBytes, signatureBytes);
    },
    buildTransactionId: function (dataBytes) {
        if (!dataBytes || !(dataBytes instanceof Uint8Array)) {
            throw new Error('Missing or invalid data');
        }
        let hash = blake2b(dataBytes);
        return Base58.encode(hash);
    },
    buildKeyPair: function (seed, nonce) {
        if (typeof seed !== 'string') {
            throw new Error('Invalid seed phrase');
        }
        let seedHash = buildSeedHash(seed, nonce);
        let keys = Axlsign.generateKeyPair(seedHash);
        return {
            private_key: keys.private,
            public_key: keys.public
        };
    },
    encryptSeed: function (seed, password, encryptionRounds) {
        if (typeof seed !== 'string') {
            throw new Error('Seed is required');
        }
        if (!password || typeof password !== 'string') {
            throw new Error('Password is required');
        }
        password = strengthenPassword(password, encryptionRounds);
        return CryptoJS.AES.encrypt(seed, password).toString();
    },
    decryptSeed: function (encryptedSeed, password, encryptionRounds) {
        if (!encryptedSeed || typeof encryptedSeed !== 'string') {
            throw new Error('Encrypted seed is required');
        }
        if (!password || typeof password !== 'string') {
            throw new Error('Password is required');
        }
        password = strengthenPassword(password, encryptionRounds);
        let hexSeed = CryptoJS.AES.decrypt(encryptedSeed, password);
        return Converters.hexStringToString(hexSeed.toString());
    },
    generateRandomUint32Array: function (length) {
        if (!length || length < 0) {
            throw new Error('Missing or invalid array length');
        }
        let a = SecureRandom.default.randomUint8Array(length);
        let b = SecureRandom.default.randomUint8Array(length);
        let result = new Uint32Array(length);
        for (let i = 0; i < length; i++) {
            let hash = Converters.byteArrayToHexString(sha256("" + a[i] + b[i]));
            let randomValue = parseInt(hash.slice(0, 13), 16);
            result.set([randomValue], i);
        }
        return result;
    },
    hash:function(input) {
        return hashChain(input);
    }
};

export default Crypto;
//# sourceMappingURL=crypto.js.map
