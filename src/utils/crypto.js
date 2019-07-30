"use strict";
// Derived from waves-api
//
Object.defineProperty(exports, "__esModule", { value: true });
import CryptoJS from 'crypto-js';
import axlsign_1 from 'axlsign';
import base58_1 from 'base-58';
import blake2b_1 from 'blake2b';
import converters_1 from './converters';
import secure_random_1 from './secure-random';
import sha3_1 from 'js-sha3';
import { concatUint8Arrays } from './concat';
import { PRIVATE_KEY_BYTE_LENGTH, PUBLIC_KEY_BYTE_LENGTH, ADDRESS_VERSION } from '../constants';

function sha256(input) {
    let bytes;
    if (typeof input === 'string') {
        bytes = converters_1.stringToByteArray(input);
    }
    else {
        bytes = input;
    }
    let wordArray = converters_1.byteArrayToWordArrayEx(Uint8Array.from(bytes));
    let resultWordArray = CryptoJS.SHA256(wordArray);
    return converters_1.wordArrayToByteArrayEx(resultWordArray);
}
function blake2b(input) {
    let output = new Uint8Array(32);
    blake2b_1(output.length).update(input).digest(output)
    return output;
}
function keccak(input) {
    return sha3_1.keccak256.array(input);
}
function hashChain(input) {
    return keccak(blake2b(input));
}
function buildSeedHash(seed, nonce) {
    let seedNonceStr = nonce.toString() + seed
    let seedBytesWithNonce = Uint8Array.from(converters_1.stringToByteArray(seedNonceStr));
    let seedHash = hashChain(seedBytesWithNonce);
    return sha256(seedHash);
}
function strengthenPassword(password, rounds) {
    if (rounds === void 0) { rounds = 5000; }
    while (rounds--)
        password = converters_1.byteArrayToHexString(sha256(password));
    return password;
}
exports.default = {
    sha256ForCheckSum: function (input) {
        let checkSum = converters_1.byteArrayToHexString(sha256(input));
        return checkSum.slice(0, 8)
    },
    buildTransactionSignature: function (dataBytes, privateKey) {
        if (!dataBytes || !(dataBytes instanceof Uint8Array)) {
            throw new Error('Missing or invalid data');
        }
        if (!privateKey || typeof privateKey !== 'string') {
            throw new Error('Missing or invalid private key');
        }
        let privateKeyBytes = base58_1.decode(privateKey);
        if (privateKeyBytes.length !== PRIVATE_KEY_BYTE_LENGTH) {
            throw new Error('Invalid private key');
        }
        let signature = axlsign_1.sign(privateKeyBytes, dataBytes, secure_random_1.default.randomUint8Array(64));
        return base58_1.encode(signature);
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
        let signatureBytes = base58_1.decode(signature);
        let publicKeyBytes = base58_1.decode(publicKey);
        if (publicKeyBytes.length !== PUBLIC_KEY_BYTE_LENGTH) {
            throw new Error('Invalid public key');
        }
        return axlsign_1.verify(publicKeyBytes, dataBytes, signatureBytes);
    },
    buildTransactionId: function (dataBytes) {
        if (!dataBytes || !(dataBytes instanceof Uint8Array)) {
            throw new Error('Missing or invalid data');
        }
        let hash = blake2b(dataBytes);
        return base58_1.encode(hash);
    },
    buildKeyPair: function (seed, nonce) {
        if (typeof seed !== 'string') {
            throw new Error('Invalid seed phrase');
        }
        let seedHash = buildSeedHash(seed, nonce);
        let keys = axlsign_1.generateKeyPair(seedHash);
        return {
            private_key: keys.private,
            public_key: keys.public
        };
    },
    isValidAddress: function (address, networkByte) {
        if (!address || typeof address !== 'string') {
            throw new Error('Missing or invalid address');
        }
        let addressBytes = base58_1.decode(address);
        if (addressBytes[0] !== ADDRESS_VERSION || addressBytes[1] !== networkByte) {
            return false;
        }
        let key = addressBytes.slice(0, 22);
        let check = addressBytes.slice(22, 26);
        let keyHash = hashChain(key).slice(0, 4);
        for (let i = 0; i < 4; i++) {
            if (check[i] !== keyHash[i]) {
                return false;
            }
        }
        return true;
    },
    buildRawAddress: function (publicKeyBytes, networkByte) {
        if (!publicKeyBytes || publicKeyBytes.length !== PUBLIC_KEY_BYTE_LENGTH || !(publicKeyBytes instanceof Uint8Array)) {
            throw new Error('Missing or invalid public key');
        }
        let prefix = Uint8Array.from([ADDRESS_VERSION, networkByte]);
        let publicKeyHashPart = Uint8Array.from(hashChain(publicKeyBytes).slice(0, 20));
        let rawAddress = concatUint8Arrays(prefix, publicKeyHashPart);
        let addressHash = Uint8Array.from(hashChain(rawAddress).slice(0, 4));
        return base58_1.encode(concatUint8Arrays(rawAddress, addressHash));
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
        return converters_1.hexStringToString(hexSeed.toString());
    },
    generateRandomUint32Array: function (length) {
        if (!length || length < 0) {
            throw new Error('Missing or invalid array length');
        }
        let a = secure_random_1.default.randomUint8Array(length);
        let b = secure_random_1.default.randomUint8Array(length);
        let result = new Uint32Array(length);
        for (let i = 0; i < length; i++) {
            let hash = converters_1.byteArrayToHexString(sha256("" + a[i] + b[i]));
            let randomValue = parseInt(hash.slice(0, 13), 16);
            result.set([randomValue], i);
        }
        return result;
    },
    hash:function(input) {
        return hashChain(input);
    }
};
//# sourceMappingURL=crypto.js.map
