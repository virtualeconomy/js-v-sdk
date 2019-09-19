"use strict";

// Object.defineProperty(exports, "__esModule", { value: true });
// import 'babel-polyfill';
import Crypto from './utils/crypto';
import Base58 from 'base-58';
import Axlsign from 'axlsign';
import Common from './utils/common';
import SecureRandom from './utils/secure-random';
import * as Constants from './constants';

function getTxType(tx) {
    if (tx.hasOwnProperty('transactionType')) {
        return Constants.OPC_TRANSACTION;
    } else if (tx.hasOwnProperty('contract')) {
        return Constants.OPC_CONTRACT;
    } else if (tx.hasOwnProperty('contractId')) {
        return Constants.OPC_FUNCTION;
    } else {
        throw new Error('Invalid tx, build tx first! ')
    }
}

export default class Account {

    constructor(network_byte) {
        this.network_byte = network_byte;
    }

    buildFromSeed(seed, nonce) {
        let key_pair = Crypto.buildKeyPair(seed, nonce);
        this.private_key = Base58.encode(key_pair.private_key);
        this.public_key = Base58.encode(key_pair.public_key);
        this.address = this.convertPublicKeyToAddress(this.public_key, this.network_byte);
    }

    buildFromPrivateKey(private_key) {
        let private_key_bytes = Base58.decode(private_key);
        let public_key_bytes = Axlsign.derivePublicKey(private_key_bytes);
        this.private_key = Base58.encode(private_key_bytes);
        this.public_key = Base58.encode(public_key_bytes);
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

    async sendTransaction(node, tx) {
        // node = Blockchain object
        let transaction_type = getTxType(tx);
        switch (transaction_type) {
            case Constants.OPC_TRANSACTION: {
                if (tx['transactionType'] === Constants.PAYMENT_TX) {
                    return await node.sendPaymentTx(tx);
                } else if (tx['transactionType'] === Constants.LEASE_TX) {
                    return await node.sendLeasingTx(tx);
                } else if (tx['transactionType'] === Constants.CANCEL_LEASE_TX) {
                    return await node.sendCancelLeasingTx(tx);
                }

            }
            case Constants.OPC_CONTRACT:
                return await node.sendRegisterContractTx(tx);
            case Constants.OPC_FUNCTION:
                return await node.sendExecuteContractTx(tx);
        }
    }

    getSignature(data_bytes) {
        if (!this.private_key || typeof this.private_key !== 'string') {
            throw new Error('Missing or invalid private key');
        }
        let private_key_bytes = Base58.decode(this.private_key);
        if (private_key_bytes.length !== Constants.PRIVATE_KEY_BYTE_LENGTH) {
            throw new Error('Invalid private key');
        }
        let signature = Axlsign.sign(private_key_bytes, data_bytes, SecureRandom.default.randomUint8Array(64));
        return Base58.encode(signature);
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
        let address_bytes = Base58.decode(address);
        if (address_bytes[0] !== Constants.ADDRESS_VERSION || address_bytes[1] !== this.network_byte) {
            return false;
        }
        let key = address_bytes.slice(0, 22);
        let check = address_bytes.slice(22, 26);
        let key_hash = Crypto.hash(key).slice(0, 4);
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
            public_key_bytes = Base58.decode(public_key);
        } else {
            public_key_bytes = public_key;
        }
        if (!public_key_bytes || public_key_bytes.length !== Constants.PUBLIC_KEY_BYTE_LENGTH || !(public_key_bytes instanceof Uint8Array)) {
            throw new Error('Missing or invalid public key');
        }
        let prefix = Uint8Array.from([Constants.ADDRESS_VERSION, network_byte]);
        let public_key_hash_part = Uint8Array.from(Crypto.hash(public_key_bytes).slice(0, 20));
        let raw_address = Common.concatUint8Arrays(prefix, public_key_hash_part);
        let address_hash = Uint8Array.from(Crypto.hash(raw_address).slice(0, 4));
        return Base58.encode(Common.concatUint8Arrays(raw_address, address_hash));
    }
};
