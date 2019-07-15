"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
import "babel-polyfill";
const fetch = require("node-fetch");
var crypto_1 = require("../libs/utils/crypto");
var base58_1 = require("../libs/utils/base58");
var axlsign_1 = require("../libs/utils/axlsign")
var secure_random_1 = require("../libs/utils/secure-random");
const { PRIVATE_KEY_BYTE_LENGTH } = require("../libs/constants");
async function postRequest (host, path, data) {
    const url = host + path;
    const jsonData = JSON.stringify(data).replace(/"amount":"(\d+)"/g, '"amount":$1')
    const config = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: jsonData
    }
    const response = await fetch(url, config)
    return await response.json();
}

module.exports = class Account {

    constructor(network_byte) {
        this.network_byte = network_byte;
    }

    buildFromSeed(seed, nonce) {
        var key_pair = crypto_1.default.buildKeyPair(seed, nonce);
        this.private_key = base58_1.default.encode(key_pair.private_key);
        this.public_key = base58_1.default.encode(key_pair.public_key);
        this.address = crypto_1.default.buildRawAddress(key_pair.public_key, this.network_byte);
    }

    buildFromPrivateKey(private_key) {
        let pk = new Uint8Array(32);
        let sk = base58_1.default.decode(private_key)
        let key_pair= axlsign_1.default.generateFromPrivateKey(pk, sk);
        this.private_key = base58_1.default.encode(key_pair.private);
        this.public_key = base58_1.default.encode(key_pair.public);
        this.address = crypto_1.default.buildRawAddress(key_pair.public, this.network_byte);
    }
    buildColdWallet(public_key, address) {
        if (public_key) {
            let public_key_bytes = base58_1.default.decode(public_key);
            this.public_key = public_key;
            this.address = crypto_1.default.buildRawAddress(public_key_bytes, this.network_byte)
        } else {
            if (this.checkAddress(address)) {
                this.address = address
            } else {
                throw new Error('Invalid address.')
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
        let private_key_bytes = base58_1.default.decode(this.private_key);
        if (private_key_bytes.length !== PRIVATE_KEY_BYTE_LENGTH) {
            throw new Error('Invalid private key');
        }
        let signature = axlsign_1.default.sign(private_key_bytes, data_bytes, secure_random_1.default.randomUint8Array(64));
        return base58_1.default.encode(signature);
    }

    getPublicKey() {
        if (!this.public_key) {
            throw new Error('No public key in account.')
        }
        return this.public_key
    }

    getPrivateKey() {
        if (!this.private_key) {
            throw new Error('No private key in account.')
        }
        return this.private_key
    }

    getAddress() {
        if (!this.address) {
            if (!this.public_key) {
                throw new Error('No public key in account.')
            }
            let public_key_bytes = base58_1.default.decode(this.public_key)
            this.address = crypto_1.default.buildRawAddress(public_key_bytes, this.network_byte)
        }
        return this.address
    }

    checkAddress(address) {
        return crypto_1.default.isValidAddress(address, this.network_byte)
    }

    convertPublicKeyToAddress(public_key, network_byte) {
        let public_key_bytes = base58_1.default.decode(public_key)
        let address = crypto_1.default.buildRawAddress(public_key_bytes, network_byte)
        return address
    }
};
