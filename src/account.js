"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
import "babel-polyfill";
const fetch = require("node-fetch");
var crypto_1 = require("../libs/utils/crypto");
var base58_1 = require("base-58");
var axlsign_1 = require("axlsign");
var concat_1 = require("../libs/utils/concat");
var secure_random_1 = require("../libs/utils/secure-random");
var constants = require("../libs/constants");
async function postRequest (node, tx) {
    const url = node;
    const jsonData = JSON.stringify(tx).replace(/"amount":"(\d+)"/g, '"amount":$1');
    const config = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: jsonData
    }
    const response = await fetch(url, config);
    return await response.json();
}

module.exports = class Account {

    constructor(network_byte) {
        this.network_byte = network_byte;
    }

    buildFromSeed(seed, nonce) {
        let key_pair = crypto_1.default.buildKeyPair(seed, nonce);
        this.private_key = base58_1.encode(key_pair.private_key);
        this.public_key = base58_1.encode(key_pair.public_key);
        this.address = this.convertPublicKeyToAddress(this.public_key, this.network_byte);
    }

    buildFromPrivateKey(private_key) {
        let private_key_bytes = base58_1.decode(private_key);
        let public_key_bytes = axlsign_1.derivePublicKey(private_key_bytes)
        this.private_key = base58_1.encode(private_key_bytes);
        this.public_key = base58_1.encode(public_key_bytes);
        this.address = this.convertPublicKeyToAddress(this.public_key, this.network_byte);
    }
    buildColdWallet(public_key, address) {
        if (public_key) {
            this.public_key = public_key;
            this.address = this.convertPublicKeyToAddress(this.public_key, this.network_byte);
        } else {
            if (this.checkAddress(address)) {
                this.address = address;
            } else {
                throw new Error('Invalid address.');
            }
        }
    }

    async sendTransactionTx(node, tx) {
        return await postRequest(node, tx);
    }

    getSignature(data_bytes) {
        if (!this.private_key || typeof this.private_key !== 'string') {
            throw new Error('Missing or invalid private key');
        }
        let private_key_bytes = base58_1.decode(this.private_key);
        if (private_key_bytes.length !== constants.PRIVATE_KEY_BYTE_LENGTH) {
            throw new Error('Invalid private key');
        }
        let signature = axlsign_1.sign(private_key_bytes, data_bytes, secure_random_1.default.randomUint8Array(64));
        return base58_1.encode(signature);
    }

    getPublicKey() {
        if (!this.public_key) {
            throw new Error('No public key in account.');
        }
        return this.public_key;
    }

    getPrivateKey() {
        if (!this.private_key) {
            throw new Error('No private key in account.');
        }
        return this.private_key;
    }

    getAddress() {
        if (!this.address) {
            if (!this.public_key) {
                throw new Error('No public key in account.');
            }
            this.address = this.convertPublicKeyToAddress(this.public_key, this.network_byte);
        }
        return this.address;
    }

    checkAddress(address) {
        if (!address || typeof address !== 'string') {
            throw new Error('Missing or invalid address');
        }
        let address_bytes = base58_1.decode(address);
        if (address_bytes[0] !== constants.ADDRESS_VERSION || address_bytes[1] !== this.network_byte) {
            return false;
        }
        let key = address_bytes.slice(0, 22);
        let check = address_bytes.slice(22, 26);
        let key_hash = crypto_1.default.hash(key).slice(0, 4);
        for (let i = 0; i < 4; i++) {
            if (check[i] !== key_hash[i]) {
                return false;
            }
        }
        return true;
    }

    convertPublicKeyToAddress(public_key, network_byte) {
        let public_key_bytes;
        if (typeof public_key === 'string' || public_key instanceof String) {
            public_key_bytes = base58_1.decode(public_key);
        } else {
            public_key_bytes = public_key;
        }
        if (!public_key_bytes || public_key_bytes.length !== constants.PUBLIC_KEY_BYTE_LENGTH || !(public_key_bytes instanceof Uint8Array)) {
            throw new Error('Missing or invalid public key');
        }
        let prefix = Uint8Array.from([constants.ADDRESS_VERSION, network_byte]);
        let public_key_hash_part = Uint8Array.from(crypto_1.default.hash(public_key_bytes).slice(0, 20));
        let raw_address = concat_1.concatUint8Arrays(prefix, public_key_hash_part);
        let address_hash = Uint8Array.from(crypto_1.default.hash(raw_address).slice(0, 4));
        return base58_1.encode(concat_1.concatUint8Arrays(raw_address, address_hash));
    }
};
