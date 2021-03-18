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
import ByteProcessor from './byteProcessor';
import Crypto from './crypto';
import Common from './common';
import Base58 from 'base-58';
import * as Constants from '../constants';

// Fields of the original data object
var paymentField = {
    timestamp: new ByteProcessor.Long('timestamp'),
    amount: new ByteProcessor.Long('amount'),
    fee: new ByteProcessor.Long('fee'),
    feeScale: new ByteProcessor.Short('feeScale'),
    recipient: new ByteProcessor.Recipient('recipient'),
    attachment: new ByteProcessor.Attachment('attachment')
};
var leaseField = {
    recipient: new ByteProcessor.Recipient('recipient'),
    amount: new ByteProcessor.Long('amount'),
    fee: new ByteProcessor.Long('fee'),
    feeScale: new ByteProcessor.Short('feeScale'),
    timestamp: new ByteProcessor.Long('timestamp')
};
var cancelLeasingField = {
    fee: new ByteProcessor.Long('fee'),
    feeScale: new ByteProcessor.Short('feeScale'),
    timestamp: new ByteProcessor.Long('timestamp'),
    txId: new ByteProcessor.Base58('transactionId')
};
var executeContractField = {
    contractId: new ByteProcessor.Base58('contractId'),
    functionIndex: new ByteProcessor.Short('functionIndex'),
    functionData: new ByteProcessor.DataEntry('functionData'),
    attachment: new ByteProcessor.Attachment('attachment'),
    fee: new ByteProcessor.Long('fee'),
    feeScale: new ByteProcessor.Short('feeScale'),
    timestamp: new ByteProcessor.Long('timestamp'),
};
var registerContractField = {
    contract: new ByteProcessor.Contract('contract'),
    initData: new ByteProcessor.DataEntry('initData'),
    description: new ByteProcessor.Attachment('description'),
    fee: new ByteProcessor.Long('fee'),
    feeScale: new ByteProcessor.Short('feeScale'),
    timestamp: new ByteProcessor.Long('timestamp'),
};


function getFields(type) {
    let storedFields = {};
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
    return storedFields;
}

function makeByteProviders(txType, storedFields) {
    let byteProviders = [];
    byteProviders.push(Uint8Array.from([txType]));
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

// Save all needed values from user data
function getData(transferData, storedFields) {
    let userData = Object.keys(storedFields).reduce(function(store, key) {
        store[key] = transferData[key];
        return store;
    }, {});
    return userData;
}

function getBytes(transferData, txType) {
    let storedFields = getFields(txType);
    let byteProviders = makeByteProviders(txType, storedFields);
    if (transferData === void 0) { transferData = {}; }
    // Save all needed values from user data
    let userData = getData(transferData, storedFields );
    let _dataHolders = byteProviders.map(function(provider) {
        if (typeof provider === 'function') {
            return provider(userData);
        } else {
            return provider;
        }
    });
    return Common.concatUint8Arrays.apply(void 0, _dataHolders);
}

function getExactBytes(fieldName, storedFields, userData) {
    if (!(fieldName in storedFields)) {
        throw new Error("There is no field '" + fieldName + "' in transfer transaction");
    }
    return storedFields[fieldName].process(userData[fieldName]);
}

function getSignature(transferData, keyPair, txType, storedFields) {
    return Crypto.default.buildTransactionSignature(getBytes(__assign({}, transferData, storedFields), txType, storedFields), keyPair.privateKey);
}

function transformAttachment(storedFields, userData) {
    return Base58.encode(Uint8Array.from(Array.prototype.slice.call(getExactBytes('attachment', storedFields, userData), 2)));
}


function castToAPISchema(data, txType, storedFields, userData) {
    let apiSchema = data;

    if (txType === Constants.PAYMENT_TX) {
        __assign(apiSchema, { attachment: transformAttachment(storedFields, userData) });
    }
    return apiSchema;
}


const TxUtil = {
    toBytes: function(transferData, txType) {
        return getBytes(
            __assign(txType ? { transactionType: txType } : {}, transferData),
            txType,
        );
    },
    prepareForAPI: function(transferData, keyPair, txType) {
        let signature = getSignature(transferData, keyPair, txType);
        return __assign({},
            txType ? { transactionType: txType } : {}, { senderPublicKey: keyPair.publicKey },
            castToAPISchema(userData, txType), { signature: signature },
        );
    },
    isValidSignature: function(data, signature, publicKey, txType) {
        return Crypto.verifySignature(
            getBytes(data, txType),
            signature,
            publicKey,
        );
    },
    prepareColdForAPI: function(transferData, signature, publicKey, txType) {
        let storedFields = getFields(txType);
        let userData = getData(transferData, storedFields);
        return __assign({},
            txType ? { transactionType: txType } : {}, { senderPublicKey: publicKey },
            castToAPISchema(userData, txType), { signature: signature },
        );
    },
};

export default TxUtil;

