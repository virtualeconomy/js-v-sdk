"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (let s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (let p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
    }
    return t;
};
import ByteProcessor from '../../libs/utils/byteProcessor';
import Crypto from '../../libs/utils/crypto';
import Common from '../../libs/utils/common';
import Base58 from 'base-58';
import * as Constants from '../../libs/constants';

// Fields of the original data object
var paymentField = {
    timestamp: new ByteProcessor.Long('timestamp'),
    amount: new ByteProcessor.Long('amount'),
    fee: new ByteProcessor.Long('fee'),
    feeScale: new ByteProcessor.Short('feeScale'),
    recipient: new ByteProcessor.Recipient('recipient'),
    attachment: new ByteProcessor.Attachment('attachment')
}
var leaseField = {
    recipient: new ByteProcessor.Recipient('recipient'),
    amount: new ByteProcessor.Long('amount'),
    fee: new ByteProcessor.Long('fee'),
    feeScale: new ByteProcessor.Short('feeScale'),
    timestamp: new ByteProcessor.Long('timestamp')
}
var cancelLeasingField = {
    fee: new ByteProcessor.Long('fee'),
    feeScale: new ByteProcessor.Short('feeScale'),
    timestamp: new ByteProcessor.Long('timestamp'),
    txId: new ByteProcessor.Base58('transactionId')
}
var executeContractField = {
    contractId: new ByteProcessor.Base58('contractId'),
    functionIndex: new ByteProcessor.Short('functionIndex'),
    functionData: new ByteProcessor.DataEntry('functionData'),
    attachment: new ByteProcessor.Attachment('attachment'),
    fee: new ByteProcessor.Long('fee'),
    feeScale: new ByteProcessor.Short('feeScale'),
    timestamp: new ByteProcessor.Long('timestamp'),
}
var registerContractField = {
    contract: new ByteProcessor.Contract('contract'),
    initData: new ByteProcessor.DataEntry('initData'),
    description: new ByteProcessor.Attachment('description'),
    fee: new ByteProcessor.Long('fee'),
    feeScale: new ByteProcessor.Short('feeScale'),
    timestamp: new ByteProcessor.Long('timestamp'),
}
var storedFields = {};



function getFields(type) {
    switch (type) {
        case Constants.PAYMENT_TX:
            storedFields = paymentField;
            break;
        case Constants.LEASE_TX:
            storedFields = leaseField;
            break;
        case Constants.CANCEL_LEASE_TX:
            storedFields = cancelLeasingField;
            break;
        case Constants.EXECUTE_CONTRACT_TX:
            storedFields = executeContractField;
            break;
        case Constants.REGISTER_CONTRACT_TX:
            storedFields = registerContractField;
            break;
    }
}

function makeByteProviders(tx_type) {
    let byteProviders = [];
    byteProviders.push(Uint8Array.from([tx_type]));
    for (let name in storedFields) {
        if (storedFields[name] instanceof ByteProcessor.ByteProcessor) {
            // All user data must be represented as bytes
            byteProviders.push(function(data) { return storedFields[name].process(data[name]); });
        } else {
            throw new Error('Invalid field is passed to the createTransactionClass function');
        }
    }
    return byteProviders;
}

var userData;
// Save all needed values from user data
function getData(transferData) {
    userData = {}
    userData = Object.keys(storedFields).reduce(function(store, key) {
        store[key] = transferData[key];
        return store;
    }, {});
}

function getBytes(transferData, tx_type) {
    let byteProviders = makeByteProviders(tx_type);
    if (transferData === void 0) { transferData = {}; }
    // Save all needed values from user data
    getData(transferData);
    let _dataHolders = byteProviders.map(function(provider) {
        if (typeof provider === 'function') {
            return provider(userData);
        } else {
            return provider;
        }
    });
    return Common.concatUint8Arrays.apply(void 0, _dataHolders);
}

function getExactBytes(fieldName) {
    if (!(fieldName in storedFields)) {
        throw new Error("There is no field '" + fieldName + "' in transfer transaction");
    }
    return storedFields[fieldName].process(userData[fieldName]);
}

function getSignature(transferData, keyPair, tx_type) {
    return Crypto.default.buildTransactionSignature(getBytes(__assign({}, transferData), tx_type), keyPair.privateKey);
}

function transformAttachment() {
    return Base58.encode(Uint8Array.from(Array.prototype.slice.call(getExactBytes('attachment'), 2)));
}

function transformRecipient() {
    return remap_1.addRecipientPrefix(userData['recipient']);
}

function castToAPISchema(data, tx_type) {
    let apiSchema = data;

    if (tx_type === Constants.PAYMENT_TX) {
        __assign(apiSchema, { attachment: transformAttachment() });
    }
    __assign(apiSchema, { recipient: transformRecipient() });
    return apiSchema;
}

exports.default = {
    toBytes: function(transferData, tx_type) {
        getFields(tx_type);
        return getBytes(__assign(tx_type ? { transactionType: tx_type } : {}, transferData), tx_type);
    },
    prepareForAPI: function(transferData, keyPair, tx_type) {
        getFields(tx_type);
        let signature = getSignature(transferData, keyPair, tx_type);
        return __assign({}, (tx_type ? { transactionType: tx_type } : {}), { senderPublicKey: keyPair.publicKey }, castToAPISchema(userData, tx_type), { signature: signature });
    },
    isValidSignature: function(data, signature, publicKey, tx_type) {
        getFields(tx_type);
        return Crypto.default.isValidTransactionSignature(getBytes(data, tx_type), signature, publicKey);
    },
    prepareColdForAPI: function(transferData, signature, publicKey, tx_type) {
        getFields(tx_type);
        getData(transferData);
        return __assign({}, (tx_type ? { transactionType: tx_type } : {}), { senderPublicKey: publicKey }, castToAPISchema(userData, tx_type), { signature: signature });
    }
};