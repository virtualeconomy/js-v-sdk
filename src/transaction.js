"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

import "babel-polyfill";
import BigNumber from 'bignumber.js'
var crypto_1 = require("../libs/utils/crypto");
var convert_1 = require("../libs/utils/convert")
var base58_1 = require("base-58");
var blake2b_1 = require("blake2b");
var tx_1 = require("../libs/utils/transaction");
var constants = require("../libs/constants");
var contract = require("../libs/contract");

var stored_tx = {}; // Fields for original data
var cold_tx = {}; // Fields for ColdSignature
var sending_tx = {}; //Fields for sending to API
const function_string_type = ['SUPERSEDE', 'ISSUE', 'DESTROY', 'SPLIT', 'SEND'];
function getTxType() {
    if (stored_tx.hasOwnProperty('transactionType')) {
        return constants.OPC_TRANSACTION;
    } else if (stored_tx.hasOwnProperty('contract')) {
        return constants.OPC_CONTRACT;
    } else if (stored_tx.hasOwnProperty('contractId')) {
        return constants.OPC_FUNCTION;
    } else {
        throw new Error('Invalid tx, build tx first! ')
    }

}
function getApi() {
    if (!cold_tx.hasOwnProperty('amount')) {
        return 1;
    }
    let amount = cold_tx['amount'];
    if ((BigNumber(amount).isLessThan(BigNumber(Number.MAX_SAFE_INTEGER).dividedBy(1e8)) || BigNumber(amount).multipliedBy(1e8).mod(100).isEqualTo(0))) {
        return 1;
    } else return constants.API_VERSION;
}

function checkStoredTx() {
    for ( let key in stored_tx) {
        if (stored_tx[key] === undefined && key !== 'attachment') {
            throw new Error('Missing ' + key + ' value,' +"build valid tx!" );
        }
    }
}

function convertAmountToMinimumUnit(amount_str) {
    let amount = Number(amount_str) * constants.VSYS_PRECISION;
    if (amount > Number.MAX_SAFE_INTEGER) {
        amount = BigNumber(amount_str).multipliedBy(constants.VSYS_PRECISION).toFixed(0);
    }
    return amount;
}

function transferAmount(amount_data) {
    let byte_arr = convert_1.default.bigNumberToByteArray(amount_data);
    let type_arr = new Array(1);
    type_arr[0] = constants.AMOUNT_TYPE;
    let data_arr = type_arr.concat(byte_arr);
    return data_arr;
}

function transferShortTxt(description) {
    let byte_arr = convert_1.default.stringToByteArray(description);

    let type_arr = new Array(1);
    type_arr[0] = constants.SHORTTEXT_TYPE ;
    let length = byte_arr.length;
    let length_arr = convert_1.default.shortToByteArray(length);
    return type_arr.concat(length_arr.concat(byte_arr));
}

function processAttachment(description) {
    return base58_1.encode(convert_1.default.stringToByteArray(description));
}

function transferAccount(account) {
    let account_arr = base58_1.decode(account);
    let type_arr = [constants.ACCOUNT_ADDR_TYPE];
    type_arr = type_arr.concat(Array.from(account_arr));
    return type_arr;
}


// Data process function for registering contract and executing contract
function processContractData(init_data) {
    if(!init_data.hasOwnProperty('amount')) {
        throw new Error("There is no field 'amount' in initData");
    }
    if(!init_data.hasOwnProperty('unity')) {
        throw new Error("There is no field 'unity' in initData");
    }
    if(!init_data.hasOwnProperty('token_description')) {
        throw new Error("There is no field 'token_description' in initData");
    }
    let max = BigNumber(init_data['amount']).multipliedBy(BigNumber(init_data['unity']));
    let unity = BigNumber(init_data['unity']);
    let token_description = init_data['token_description'];
    let max_arr = transferAmount(max);
    let unity_arr = transferAmount(unity);
    let des_arr = transferShortTxt(token_description);
    let parameters_num = convert_1.default.shortToByteArray(3);
    let encode_arr = parameters_num.concat(max_arr.concat(unity_arr.concat(des_arr)));
    return base58_1.encode(encode_arr);
}
function processFunctionData(init_data, type) {
    let parameters_num,encode_arr,amount,account_arr,amount_arr;
    switch (type) {
        case 'SUPERSEDE' :
            if(init_data.hasOwnProperty('new_issuer')) {
                let new_issuer = init_data['new_issuer'];
                account_arr = transferAccount(new_issuer);
                parameters_num = convert_1.default.shortToByteArray(1);
                encode_arr = parameters_num.concat(account_arr);
                return base58_1.encode(Uint8Array.from(encode_arr));
            } else {
                throw new Error("There is no field 'new_issuer' in functionData");
            }
        case 'ISSUE' : case 'DESTROY':
            if(!init_data.hasOwnProperty('amount')) {
                throw new Error("There is no field 'amount' in functionData");
            }
            if(!init_data.hasOwnProperty('unity')) {
                throw new Error("There is no field 'unity' in functionData");
            }
            amount = init_data['amount'];
            let unity = init_data['unity'];
            amount_arr = transferAmount(BigNumber(amount).multipliedBy(unity));
            parameters_num = convert_1.default.shortToByteArray(1);
            encode_arr = parameters_num.concat(amount_arr);
            return base58_1.encode(Uint8Array.from(encode_arr));
        case 'SPLIT' :
            if(!init_data.hasOwnProperty('new_unity')) {
                throw new Error("There is no field 'new_unity' in functionData");
            }
            let new_unity = BigNumber(init_data['new_unity']);
            let unity_arr = transferAmount(new_unity);
            parameters_num = convert_1.default.shortToByteArray(1);
            encode_arr = parameters_num.concat(unity_arr);
            return base58_1.encode(Uint8Array.from(encode_arr));
        case 'SEND' :
            if(!init_data.hasOwnProperty('recipient')) {
                throw new Error("There is no field 'recipient' in functionData");
            }
            if(!init_data.hasOwnProperty('amount')) {
                throw new Error("There is no field 'amount' in functionData");
            }
            if(!init_data.hasOwnProperty('unity')) {
                throw new Error("There is no field 'unity' in functionData");
            }
            let recipient = init_data['recipient'];
            amount = BigNumber(init_data['amount']).multipliedBy(init_data['unity']);
            account_arr = transferAccount(recipient);
            amount_arr = transferAmount(amount);
            parameters_num = convert_1.default.shortToByteArray(2);
            encode_arr = parameters_num.concat(account_arr.concat(amount_arr));
            return base58_1.encode(Uint8Array.from(encode_arr));
        default :
            throw new Error('Wrong function index!');
    }
}


// Fields-process functions for cold signature
function getContractColdFields(network_byte) {
    let init_data = cold_tx['initData'];
    if(!init_data.hasOwnProperty('amount')) {
        throw new Error("There is no field 'amount' in initData");
    }
    if(!init_data.hasOwnProperty('unity')) {
        throw new Error("There is no field 'unity' in initData");
    }
    if(!init_data.hasOwnProperty('token_description')) {
        throw new Error("There is no field 'token_description' in initData");
    }
    let amount = init_data['amount'];
    let unity = init_data['unity'];
    let token_description = init_data['token_description'];
    let public_key_bytes = base58_1.decode(cold_tx['senderPublicKey']);
    cold_tx['address'] = crypto_1.default.buildRawAddress(public_key_bytes, network_byte);
    cold_tx['contractInitExplain'] = 'Create token' + (cold_tx['contract'] === contract.CONTRACT ? ' ' : ' (support split) ') + 'with max supply ' + BigNumber(amount);
    cold_tx['contractInitTextual'] = "init(max=" + BigNumber(amount) + ",unity= "+ BigNumber(unity) + ",tokenDescription='" + token_description + "')";
    cold_tx['contractInit'] = processContractData(cold_tx['initData']);
    delete cold_tx['senderPublicKey'];
    delete cold_tx['initData'];
}

function getFunctionColdFields(function_type, network_byte) {
    let init_data = cold_tx['functionData'];
    switch (function_type) {
        case constants.SUPERSEDE_FUNCIDX:
            cold_tx['functionExplain'] = 'Set issuer to ' + init_data['new_issuer'];
            break;
        case constants.ISSUE_FUNCIDX:
            cold_tx['functionExplain'] = 'Issue ' + init_data['amount'] + ' Token';
            break;
        case constants.DESTROY_FUNCIDX:
            cold_tx['functionExplain'] = 'Destroy ' + init_data['amount'] + ' Token';
            break;
    }
    if ((function_type === constants.SEND_FUNCIDX && stored_tx['attachment'] !== undefined) || function_type === constants.SEND_FUNCIDX_SPLIT  ) {
        cold_tx['attachment'] = processAttachment(cold_tx['attachment']);
        cold_tx['function'] = processFunctionData(init_data, 'SEND');
        cold_tx['functionExplain'] = 'send ' + init_data['amount'] + ' token to ' + init_data['recipient'];
    } else {
        if (function_type === constants.SPLIT_FUNCIDX && stored_tx['attachment'] === undefined) {
            cold_tx['functionExplain'] = 'Set token unity to ' + init_data['new_unity'];
        }
        cold_tx['attachment'] = '';
        cold_tx['function'] = processFunctionData(init_data, function_string_type[function_type]);
    }
    let public_key_bytes = base58_1.decode(cold_tx['senderPublicKey']);
    cold_tx['address'] = crypto_1.default.buildRawAddress(public_key_bytes, network_byte);
    cold_tx['functionId'] = cold_tx['functionIndex'];
    delete cold_tx['functionIndex'];
    delete cold_tx['senderPublicKey'];
    delete cold_tx['functionData'];
}

// Fields-process functions for sending TX
function getTransactionFields(type) {
    switch (type) {
        case constants.PAYMENT_TX:
            sending_tx['recipient'] = "address:" + sending_tx['recipient'];
            sending_tx['attachment'] = processAttachment(sending_tx['attachment']);
            break;
        case constants.LEASE_TX:
            sending_tx['recipient'] = "address:" + sending_tx['recipient'];
            break;
        case constants.CANCEL_LEASE_TX:
            sending_tx['recipient'] = "address:undefined";
            break;
    }
}
function getContractFields() {
    sending_tx['initData'] = processContractData(sending_tx['initData']);
}
function getFunctionFields(function_type) {
    let init_data = sending_tx['functionData'];
    if ((function_type === constants.SEND_FUNCIDX && stored_tx['attachment'] !== undefined) || function_type === constants.SEND_FUNCIDX_SPLIT  ) {
        sending_tx['attachment'] = processAttachment(sending_tx['attachment']);
        sending_tx['functionData'] = processFunctionData(init_data, 'SEND');
    } else {
        delete sending_tx['attachment'];
        sending_tx['functionData'] = processFunctionData(init_data, function_string_type[function_type]);
    }
}


module.exports = class Transaction {

    constructor(network_byte) {
        this.network_byte = network_byte;
    }

    buildPaymentTx(public_key, recipient, amount, attachment, timestamp) {
        if (!timestamp) {
            timestamp = Date.now() * 1e6;
        }
        if (!attachment) {
            attachment = '';
        }
        let tx = {
            senderPublicKey: public_key,
            recipient: recipient,
            amount: convertAmountToMinimumUnit(amount),
            fee: constants.TX_FEE * constants.VSYS_PRECISION,
            feeScale: constants.FEE_SCALE,
            timestamp: timestamp,
            attachment: attachment,
            transactionType: constants.PAYMENT_TX
        }
        stored_tx = tx;
        return tx;
    }

    buildLeasingTx(public_key, recipient, amount, timestamp) {
        if (!timestamp) {
            timestamp = Date.now() * 1e6;
        }
        let tx = {
            senderPublicKey: public_key,
            recipient: recipient,
            amount: convertAmountToMinimumUnit(amount),
            fee: constants.TX_FEE * constants.VSYS_PRECISION,
            feeScale: constants.FEE_SCALE,
            timestamp: timestamp,
            transactionType: constants.LEASE_TX
        }
        stored_tx = tx;
        return tx;
    }

    buildCancelLeasingTx(public_key, lease_id, timestamp) {
        if (!timestamp) {
            timestamp = Date.now() * 1e6;
        }
        let tx = {
            senderPublicKey: public_key,
            txId: lease_id,
            fee: constants.TX_FEE * constants.VSYS_PRECISION,
            feeScale: constants.FEE_SCALE,
            timestamp: timestamp,
            transactionType: constants.CANCEL_LEASE_TX
        }
        stored_tx = tx;
        return tx;
    }

    buildRegisterContractTx(public_key, contract, init_data, description, timestamp) {
        if (!timestamp) {
            timestamp = Date.now() * 1e6;
        }
        if (!description) {
            description = '';
        }
        let tx = {
            contract: contract,
            description: description,
            fee: constants.TOKEN_FEE * constants.VSYS_PRECISION,
            feeScale: constants.FEE_SCALE,
            initData: init_data,
            senderPublicKey: public_key,
            timestamp: timestamp
        }
        stored_tx = tx;
        return tx;
    }

    buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment) {
        if (!timestamp) {
            timestamp = Date.now() * 1e6;
        }
        let tx = {
            contractId: contract_id,
            fee: constants.CONTRACT_EXEC_FEE * constants.VSYS_PRECISION,
            feeScale: constants.FEE_SCALE,
            functionData: function_data,
            functionIndex: function_index,
            senderPublicKey: public_key,
            timestamp: timestamp,
            attachment: attachment
        }
        stored_tx = tx;
        return tx;
    }
    toJsonForColdSignature() {
        let tx_type = getTxType();
        checkStoredTx();
        cold_tx = JSON.parse(JSON.stringify(stored_tx));// deep copy
        switch (tx_type) {
            case constants.OPC_TRANSACTION:
                cold_tx['api'] = getApi();
                break;
            case constants.OPC_CONTRACT:
                cold_tx['api'] = constants.API_VERSION;
                getContractColdFields(this.network_byte);
                break;
            case constants.OPC_FUNCTION:
                cold_tx['api'] = constants.API_VERSION;
                getFunctionColdFields(stored_tx['functionIndex'], this.network_byte);
                break;
        }
        cold_tx['opc'] = tx_type;
        cold_tx['protocol'] = constants.PROTOCOL;
        return cold_tx;
    }

    toJsonForSendingTx(signature) {
        let tx_type = getTxType();
        checkStoredTx();
        sending_tx = JSON.parse(JSON.stringify(stored_tx));// deep copy
        switch (tx_type) {
            case constants.OPC_TRANSACTION:
                getTransactionFields(sending_tx['transactionType']);
                break;
            case constants.OPC_CONTRACT:
                getContractFields();
                break;
            case constants.OPC_FUNCTION:
                getFunctionFields(stored_tx['functionIndex']);
                break;
        }
        sending_tx['signature'] = signature;
        return sending_tx;
    }

    toBytes() {
        let tx_type = getTxType();
        let field_type, function_type;
        checkStoredTx();
        cold_tx = JSON.parse(JSON.stringify(stored_tx));// deep copy
        switch (tx_type) {
            case constants.OPC_TRANSACTION:
                field_type = stored_tx['transactionType'];
                return (tx_1.default.toBytes((cold_tx),field_type));
            case constants.OPC_CONTRACT:
                cold_tx['initData'] = processContractData(cold_tx['initData']);
                field_type = 8 & (255);
                return tx_1.default.toBytes((cold_tx),field_type);
            case constants.OPC_FUNCTION:
                function_type = stored_tx['functionIndex'];
                if ((function_type === constants.SEND_FUNCIDX && stored_tx['attachment'] !== undefined) || function_type === constants.SEND_FUNCIDX_SPLIT  ) {
                cold_tx['functionData'] = processFunctionData(cold_tx['functionData'], 'SEND');
                } else {
                cold_tx['attachment'] = '';
                cold_tx['functionData'] = processFunctionData(cold_tx['functionData'], function_string_type[function_type]);
                }
                field_type = 9 & (255);
                return tx_1.default.toBytes((cold_tx),field_type);
        }
    }

    buildTransactionId(data_bytes) {
        if (!data_bytes || !(data_bytes instanceof Uint8Array)) {
            throw new Error('Missing or invalid data');
        }
        let output = new Uint8Array(32);
        blake2b_1(output.length).update(data_bytes).digest(output);
        let hash = output;
        return base58_1.encode(hash);
    }
};
