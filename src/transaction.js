"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

import "babel-polyfill";
import BigNumber from 'bignumber.js';
import Account from '../libs/account';
import Convert from '../libs/utils/convert';
import Base58 from 'base-58';
import Blake2b from 'blake2b';
import Common from '../libs/utils/common'
import TxUtil from '../libs/utils/txUtil';
import * as Constants from '../libs/constants';
import * as Contract from '../libs/contract';

var stored_tx = {}; // Fields for original data
var cold_tx = {}; // Fields for ColdSignature
var sending_tx = {}; //Fields for sending to API
const function_string_type = ['SUPERSEDE', 'ISSUE', 'DESTROY', 'SPLIT', 'SEND'];
function getTxType() {
    if (stored_tx.hasOwnProperty('transactionType')) {
        return Constants.OPC_TRANSACTION;
    } else if (stored_tx.hasOwnProperty('contract')) {
        return Constants.OPC_CONTRACT;
    } else if (stored_tx.hasOwnProperty('contractId')) {
        return Constants.OPC_FUNCTION;
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
    } else return Constants.API_VERSION;
}

function checkStoredTx() {
    for ( let key in stored_tx) {
        if (stored_tx[key] === undefined && key !== 'attachment') {
            throw new Error('Missing ' + key + ' value,' +"build valid tx!" );
        }
    }
}

function convertAmountToMinimumUnit(amount_str, unity) {
    let amount = Number(amount_str) * Constants.VSYS_PRECISION;
    if (amount > Number.MAX_SAFE_INTEGER) {
        amount = BigNumber(amount_str).multipliedBy(Constants.VSYS_PRECISION).toFixed(0);
    }
    return amount;
}

function transferAmount(amount_data) {
    let byte_arr = Convert.bigNumberToByteArray(amount_data);
    let type_arr = new Array(1);
    type_arr[0] = Constants.AMOUNT_TYPE;
    let data_arr = type_arr.concat(byte_arr);
    return data_arr;
}

function transferShortTxt(description) {
    let byte_arr = Convert.stringToByteArray(description);

    let type_arr = new Array(1);
    type_arr[0] = Constants.SHORTTEXT_TYPE ;
    let length = byte_arr.length;
    let length_arr = Convert.shortToByteArray(length);
    return type_arr.concat(length_arr.concat(byte_arr));
}

function processAttachment(description) {
    return Base58.encode(Convert.stringToByteArray(description));
}

function transferAccount(account) {
    let account_arr = Base58.decode(account);
    let type_arr = [Constants.ACCOUNT_ADDR_TYPE];
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
    let parameters_num = Convert.shortToByteArray(3);
    let encode_arr = parameters_num.concat(max_arr.concat(unity_arr.concat(des_arr)));
    return Base58.encode(encode_arr);
}
function processFunctionData(init_data, type) {
    let parameters_num,encode_arr,amount,account_arr,amount_arr;
    switch (type) {
        case 'SUPERSEDE' :
            if(init_data.hasOwnProperty('new_issuer')) {
                let new_issuer = init_data['new_issuer'];
                account_arr = transferAccount(new_issuer);
                parameters_num = Convert.shortToByteArray(1);
                encode_arr = parameters_num.concat(account_arr);
                return Base58.encode(Uint8Array.from(encode_arr));
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
            parameters_num = Convert.shortToByteArray(1);
            encode_arr = parameters_num.concat(amount_arr);
            return Base58.encode(Uint8Array.from(encode_arr));
        case 'SPLIT' :
            if(!init_data.hasOwnProperty('new_unity')) {
                throw new Error("There is no field 'new_unity' in functionData");
            }
            let new_unity = BigNumber(init_data['new_unity']);
            let unity_arr = transferAmount(new_unity);
            parameters_num = Convert.shortToByteArray(1);
            encode_arr = parameters_num.concat(unity_arr);
            return Base58.encode(Uint8Array.from(encode_arr));
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
            parameters_num = Convert.shortToByteArray(2);
            encode_arr = parameters_num.concat(account_arr.concat(amount_arr));
            return Base58.encode(Uint8Array.from(encode_arr));
        default :
            throw new Error('Wrong function index!');
    }
}


// Fields-process functions for cold signature
function getContractColdFields(network_byte, acc) {
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
    let public_key_bytes = Base58.decode(cold_tx['senderPublicKey']);
    cold_tx['address'] = acc.convertPublicKeyToAddress(public_key_bytes, network_byte);
    cold_tx['contractInitExplain'] = 'Create token' + (cold_tx['contract'] === Contract.CONTRACT ? ' ' : ' (support split) ') + 'with max supply ' + BigNumber(amount);
    cold_tx['contractInitTextual'] = "init(max=" + BigNumber(amount) + ",unity= "+ BigNumber(unity) + ",tokenDescription='" + token_description + "')";
    cold_tx['contractInit'] = processContractData(cold_tx['initData']);
    delete cold_tx['senderPublicKey'];
    delete cold_tx['initData'];
}

function getFunctionColdFields(function_type, network_byte, acc) {
    let init_data = cold_tx['functionData'];
    switch (function_type) {
        case Constants.SUPERSEDE_FUNCIDX:
            cold_tx['functionExplain'] = 'Set issuer to ' + init_data['new_issuer'];
            break;
        case Constants.ISSUE_FUNCIDX:
            cold_tx['functionExplain'] = 'Issue ' + init_data['amount'] + ' Token';
            break;
        case Constants.DESTROY_FUNCIDX:
            cold_tx['functionExplain'] = 'Destroy ' + init_data['amount'] + ' Token';
            break;
    }
    if ((function_type === Constants.SEND_FUNCIDX && stored_tx['attachment'] !== undefined) || function_type === Constants.SEND_FUNCIDX_SPLIT  ) {
        cold_tx['attachment'] = processAttachment(cold_tx['attachment']);
        cold_tx['function'] = processFunctionData(init_data, 'SEND');
        cold_tx['functionExplain'] = 'send ' + init_data['amount'] + ' token to ' + init_data['recipient'];
    } else {
        if (function_type === Constants.SPLIT_FUNCIDX && stored_tx['attachment'] === undefined) {
            cold_tx['functionExplain'] = 'Set token unity to ' + init_data['new_unity'];
        }
        cold_tx['attachment'] = '';
        cold_tx['function'] = processFunctionData(init_data, function_string_type[function_type]);
    }
    let public_key_bytes = Base58.decode(cold_tx['senderPublicKey']);
    cold_tx['address'] = acc.convertPublicKeyToAddress(public_key_bytes, network_byte);
    cold_tx['functionId'] = cold_tx['functionIndex'];
    delete cold_tx['functionIndex'];
    delete cold_tx['senderPublicKey'];
    delete cold_tx['functionData'];
}

// Fields-process functions for sending TX
function getTransactionFields(type) {
    switch (type) {
        case Constants.PAYMENT_TX:
            sending_tx['recipient'] = "address:" + sending_tx['recipient'];
            sending_tx['attachment'] = processAttachment(sending_tx['attachment']);
            break;
        case Constants.LEASE_TX:
            sending_tx['recipient'] = "address:" + sending_tx['recipient'];
            break;
        case Constants.CANCEL_LEASE_TX:
            sending_tx['recipient'] = "address:undefined";
            break;
    }
}
function getContractFields() {
    sending_tx['initData'] = processContractData(sending_tx['initData']);
}
function getFunctionFields(function_type) {
    let init_data = sending_tx['functionData'];
    if ((function_type === Constants.SEND_FUNCIDX && stored_tx['attachment'] !== undefined) || function_type === Constants.SEND_FUNCIDX_SPLIT  ) {
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
        this.acc = new Account(network_byte);
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
            fee: Constants.TX_FEE * Constants.VSYS_PRECISION,
            feeScale: Constants.FEE_SCALE,
            timestamp: timestamp,
            attachment: attachment,
            transactionType: Constants.PAYMENT_TX
        };
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
            fee: Constants.TX_FEE * Constants.VSYS_PRECISION,
            feeScale: Constants.FEE_SCALE,
            timestamp: timestamp,
            transactionType: Constants.LEASE_TX
        };
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
            fee: Constants.TX_FEE * Constants.VSYS_PRECISION,
            feeScale: Constants.FEE_SCALE,
            timestamp: timestamp,
            transactionType: Constants.CANCEL_LEASE_TX
        };
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
            fee: Constants.TOKEN_FEE * Constants.VSYS_PRECISION,
            feeScale: Constants.FEE_SCALE,
            initData: init_data,
            senderPublicKey: public_key,
            timestamp: timestamp
        };
        stored_tx = tx;
        return tx;
    }

    buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment) {
        if (!timestamp) {
            timestamp = Date.now() * 1e6;
        }
        let tx = {
            contractId: contract_id,
            fee: Constants.CONTRACT_EXEC_FEE * Constants.VSYS_PRECISION,
            feeScale: Constants.FEE_SCALE,
            functionData: function_data,
            functionIndex: function_index,
            senderPublicKey: public_key,
            timestamp: timestamp,
            attachment: attachment
        };
        stored_tx = tx;
        return tx;
    }

    buildSendTokenTx(public_key, token_id, recipient, amount, unity, is_split_supported, attachment) {
        if (attachment === undefined) {
            attachment = '';
        }
        let function_index = is_split_supported? Constants.SEND_FUNCIDX_SPLIT : Constants.SEND_FUNCIDX;
        let function_data = { recipient, amount, unity};
        let contract_id = Common.tokenIDToContractID(token_id);
        let tx = {
            contractId: contract_id,
            fee: Constants.CONTRACT_EXEC_FEE * Constants.VSYS_PRECISION,
            feeScale: Constants.FEE_SCALE,
            functionData: function_data,
            functionIndex: function_index,
            senderPublicKey: public_key,
            timestamp: Date.now() * 1e6,
            attachment: attachment
        };
        stored_tx = tx;
        return tx;
    }

    toJsonForColdSignature() {
        let tx_type = getTxType();
        checkStoredTx();
        cold_tx = JSON.parse(JSON.stringify(stored_tx));// deep copy
        switch (tx_type) {
            case Constants.OPC_TRANSACTION:
                cold_tx['api'] = getApi();
                break;
            case Constants.OPC_CONTRACT:
                cold_tx['api'] = Constants.API_VERSION;
                getContractColdFields(this.network_byte, this.acc);
                break;
            case Constants.OPC_FUNCTION:
                cold_tx['api'] = Constants.API_VERSION;
                getFunctionColdFields(stored_tx['functionIndex'], this.network_byte, this.acc);
                break;
        }
        cold_tx['opc'] = tx_type;
        cold_tx['protocol'] = Constants.PROTOCOL;
        return cold_tx;
    }

    toJsonForSendingTx(signature) {
        let tx_type = getTxType();
        checkStoredTx();
        sending_tx = JSON.parse(JSON.stringify(stored_tx));// deep copy
        switch (tx_type) {
            case Constants.OPC_TRANSACTION:
                getTransactionFields(sending_tx['transactionType']);
                break;
            case Constants.OPC_CONTRACT:
                getContractFields();
                break;
            case Constants.OPC_FUNCTION:
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
            case Constants.OPC_TRANSACTION:
                field_type = stored_tx['transactionType'];
                return (TxUtil.default.toBytes((cold_tx),field_type));
            case Constants.OPC_CONTRACT:
                cold_tx['initData'] = processContractData(cold_tx['initData']);
                field_type = 8 & (255);
                return TxUtil.default.toBytes((cold_tx),field_type);
            case Constants.OPC_FUNCTION:
                function_type = stored_tx['functionIndex'];
                if ((function_type === Constants.SEND_FUNCIDX && stored_tx['attachment'] !== undefined) || function_type === Constants.SEND_FUNCIDX_SPLIT  ) {
                cold_tx['functionData'] = processFunctionData(cold_tx['functionData'], 'SEND');
                } else {
                cold_tx['attachment'] = '';
                cold_tx['functionData'] = processFunctionData(cold_tx['functionData'], function_string_type[function_type]);
                }
                field_type = 9 & (255);
                return TxUtil.default.toBytes((cold_tx),field_type);
        }
    }

    buildTransactionId(data_bytes) {
        if (!data_bytes || !(data_bytes instanceof Uint8Array)) {
            throw new Error('Missing or invalid data');
        }
        let output = new Uint8Array(32);
        Blake2b(output.length).update(data_bytes).digest(output);
        let hash = output;
        return Base58.encode(hash);
    }
};
