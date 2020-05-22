"use strict";

// Object.defineProperty(exports, "__esModule", { value: true });

// import "babel-polyfill";
import QRCode from 'qrcode'
import BigNumber from 'bignumber.js';
import Account from './account';
import Convert from './utils/convert';
import Base58 from 'base-58';
import Blake2b from 'blake2b';
import Common from './utils/common'
import TxUtil from './utils/txUtil';
import * as Constants from './constants';
import * as Contract from './contract';

const function_string_type = ['SUPERSEDE', 'ISSUE', 'DESTROY', 'SPLIT', 'SEND'];
function getTxType(stored_tx) {
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
function getApi(cold_tx) {
    if (!cold_tx.hasOwnProperty('amount')) {
        return 1;
    }
    let amount = cold_tx['amount'];
    if ((BigNumber(amount).isLessThan(BigNumber(Number.MAX_SAFE_INTEGER).dividedBy(1e8)) || BigNumber(amount).multipliedBy(1e8).mod(100).isEqualTo(0))) {
        return 1;
    } else return Constants.API_VERSION;
}

function checkStoredTx(stored_tx) {
    for ( let key in stored_tx) {
        if (stored_tx[key] === undefined && key !== 'attachment') {
            throw new Error('Missing ' + key + ' value,' +"build valid tx!" );
        }
    }
}

function convertAmountToMinimumUnit(amount_str) {
    let amount = BigNumber(amount_str).multipliedBy(Constants.VSYS_PRECISION).toNumber();
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

function transferTokenId(token_id) {
    let token_id_arr = Base58.decode(token_id)
    let type_arr = [Constants.TOKEN_ID_TYPE];
    type_arr = type_arr.concat(Array.from(token_id_arr))
    return type_arr;
}

// Data process function for registering contract and executing contract(P.S.:name will be changed to 'processTokenContractData' or support all kinds of Contract Data within the function in the future)
function processContractData(init_data) {
    let contract_type = "TOKEN_CONTRACT"
    if (init_data.hasOwnProperty('token_id')) {
        contract_type = "CONTRACT"
    }
    switch (contract_type) {
        case 'TOKEN_CONTRACT':
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
        case 'CONTRACT':
            if(!init_data.hasOwnProperty('token_id')) {
                throw new Error("There is no field 'token_id' in initData");
            }
            parameters_num = Convert.shortToByteArray(1);
            let token_id_arr = transferTokenId(init_data['token_id'])
            encode_arr = parameters_num.concat(token_id_arr)
            return Base58.encode(encode_arr)

    }
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
function getContractColdFields(cold_tx, network_byte, acc) {
    // Another Solution: throw Error.
    // if(cold_tx['contract'] !== Contract.TOKEN_CONTRACT && cold_tx['contract'] !== Contract.TOKEN_CONTRACT_WITH_SPLIT) {
    //     throw new Error("This contract is not supported in the current SDK version");
    // }
    let init_data = cold_tx['initData'];
    let public_key_bytes = Base58.decode(cold_tx['senderPublicKey']);
    cold_tx['address'] = acc.convertPublicKeyToAddress(public_key_bytes, network_byte);
    if(cold_tx['contract'] === Contract.TOKEN_CONTRACT || cold_tx['contract'] === Contract.TOKEN_CONTRACT_WITH_SPLIT) {
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
        cold_tx['contractInitExplain'] = 'Create token' + (cold_tx['contract'] === Contract.TOKEN_CONTRACT ? ' ' : ' (support split) ') + 'with max supply ' + BigNumber(amount);
        cold_tx['contractInitTextual'] = "init(max=" + BigNumber(amount) + ",unity= "+ BigNumber(unity) + ",tokenDescription='" + token_description + "')";
        cold_tx['contractInit'] = processContractData(init_data);
    } else {
        cold_tx['contractInitExplain'] = ''
        cold_tx['contractInitTextual'] = ''
        cold_tx['contractInit'] = processContractData(init_data)
    }
    delete cold_tx['senderPublicKey'];
    delete cold_tx['initData'];
}

function getFunctionColdFields(cold_tx, stored_tx, function_type, network_byte, acc) {
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
function getTransactionFields(sending_tx,type) {
    switch (type) {
        case Constants.PAYMENT_TX:
            sending_tx['recipient'] = sending_tx['recipient'];
            sending_tx['attachment'] = processAttachment(sending_tx['attachment']);
            break;
        case Constants.LEASE_TX:
            sending_tx['recipient'] = sending_tx['recipient'];
            break;
        case Constants.CANCEL_LEASE_TX:
            sending_tx['recipient'] = "undefined";
            break;
    }
    return sending_tx;
}
function getContractFields(sending_tx) {
    sending_tx['initData'] = processContractData(sending_tx['initData'])
}
function getFunctionFields(sending_tx, stored_tx, function_type) {
    let init_data = sending_tx['functionData'];
    if ((function_type === Constants.SEND_FUNCIDX && stored_tx['attachment'] !== undefined) || function_type === Constants.SEND_FUNCIDX_SPLIT  ) {
        sending_tx['attachment'] = processAttachment(sending_tx['attachment']);
        sending_tx['functionData'] = processFunctionData(init_data, 'SEND');
    } else {
        delete sending_tx['attachment'];
        sending_tx['functionData'] = processFunctionData(init_data, function_string_type[function_type]);
    }
}


export default class Transaction {

    constructor(network_byte) {
        this.stored_tx = {}; // Fields for original data
        this.cold_tx = {}; // Fields for ColdSignature
        this.sending_tx = {}; //Fields for sending to API
        this.network_byte = network_byte;
        this.acc = new Account(network_byte);
    }

    buildPaymentTx(public_key, recipient, amount, attachment, timestamp, fee) {
        fee = typeof fee !== 'undefined' ? fee : Constants.TX_FEE
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
            fee: fee * Constants.VSYS_PRECISION,
            feeScale: Constants.FEE_SCALE,
            timestamp: timestamp,
            attachment: attachment,
            transactionType: Constants.PAYMENT_TX
        };
        this.stored_tx = tx;
        return tx;
    }

    buildLeasingTx(public_key, recipient, amount, timestamp, fee) {
        fee = typeof fee !== 'undefined' ? fee : Constants.TX_FEE
        if (!timestamp) {
            timestamp = Date.now() * 1e6;
        }
        let tx = {
            senderPublicKey: public_key,
            recipient: recipient,
            amount: convertAmountToMinimumUnit(amount),
            fee: fee * Constants.VSYS_PRECISION,
            feeScale: Constants.FEE_SCALE,
            timestamp: timestamp,
            transactionType: Constants.LEASE_TX
        };
        this.stored_tx = tx;
        return tx;
    }

    buildCancelLeasingTx(public_key, lease_id, timestamp, fee) {
        fee = typeof fee !== 'undefined' ? fee : Constants.TX_FEE
        if (!timestamp) {
            timestamp = Date.now() * 1e6;
        }
        let tx = {
            senderPublicKey: public_key,
            txId: lease_id,
            fee: fee * Constants.VSYS_PRECISION,
            feeScale: Constants.FEE_SCALE,
            timestamp: timestamp,
            transactionType: Constants.CANCEL_LEASE_TX
        };
        this.stored_tx = tx;
        return tx;
    }

    buildRegisterContractTx(public_key, contract, init_data, description, timestamp, fee) {
        fee = typeof fee !== 'undefined' ? fee : Constants.CONTRACT_REGISTER_FEE
        if (!timestamp) {
            timestamp = Date.now() * 1e6;
        }
        if (!description) {
            description = '';
        }
        let tx = {
            contract: contract,
            description: description,
            fee: fee * Constants.VSYS_PRECISION,
            feeScale: Constants.FEE_SCALE,
            initData: init_data,
            senderPublicKey: public_key,
            timestamp: timestamp
        };
        this.stored_tx = tx;
        return tx;
    }

    buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment, fee) {
        fee = typeof fee !== 'undefined' ? fee : Constants.CONTRACT_EXEC_FEE
        if (!timestamp) {
            timestamp = Date.now() * 1e6;
        }
        let tx = {
            contractId: contract_id,
            fee: fee * Constants.VSYS_PRECISION,
            feeScale: Constants.FEE_SCALE,
            functionData: function_data,
            functionIndex: function_index,
            senderPublicKey: public_key,
            timestamp: timestamp,
            attachment: attachment
        };
        this.stored_tx = tx;
        return tx;
    }

    buildSendTokenTx(public_key, token_id, recipient, amount, unity, is_split_supported, attachment, timestamp, fee) {
        fee = typeof fee !== 'undefined' ? fee : Constants.CONTRACT_EXEC_FEE
        if (!timestamp) {
            timestamp = Date.now() * 1e6;
        }
        if (attachment === undefined) {
            attachment = '';
        }
        let function_index = is_split_supported? Constants.SEND_FUNCIDX_SPLIT : Constants.SEND_FUNCIDX;
        let function_data = { recipient, amount, unity};
        let contract_id = Common.tokenIDToContractID(token_id);
        let tx = {
            contractId: contract_id,
            fee: fee * Constants.VSYS_PRECISION,
            feeScale: Constants.FEE_SCALE,
            functionData: function_data,
            functionIndex: function_index,
            senderPublicKey: public_key,
            timestamp: timestamp,
            attachment: attachment
        };
        this.stored_tx = tx;
        return tx;
    }

    toJsonForColdSignature() {
        let tx_type = getTxType(this.stored_tx);
        checkStoredTx(this.stored_tx);
        this.cold_tx = JSON.parse(JSON.stringify(this.stored_tx));// deep copy
        this.cold_tx['timestamp'] = BigNumber(this.cold_tx['timestamp']).dividedBy(1e6).toNumber()
        switch (tx_type) {
            case Constants.OPC_TRANSACTION:
                this.cold_tx['api'] = getApi(this.cold_tx);
                if (this.cold_tx.hasOwnProperty('attachment')) {
                    this.cold_tx['attachment'] = processAttachment(this.cold_tx['attachment'])
                    if (this.cold_tx['attachment']) this.cold_tx['api'] = 4
                }
                break;
            case Constants.OPC_CONTRACT:
                this.cold_tx['api'] = Constants.API_VERSION;
                getContractColdFields(this.cold_tx, this.network_byte, this.acc);
                break;
            case Constants.OPC_FUNCTION:
                this.cold_tx['api'] = Constants.API_VERSION;
                getFunctionColdFields(this.cold_tx, this.stored_tx, this.stored_tx['functionIndex'], this.network_byte, this.acc);
                break;
        }
        this.cold_tx['opc'] = tx_type;
        this.cold_tx['protocol'] = Constants.PROTOCOL;
        return this.cold_tx;
    }

    async getQrBase64(cold_tx) {
        try {
            return await QRCode.toDataURL(JSON.stringify(cold_tx));
        } catch (err) {
            throw new Error(err);
        }
    }
    async getQrBase64ForColdSignature() {
        const result = this.toJsonForColdSignature();
        return await this.getQrBase64(result);
    }
    toJsonForSendingTx(signature) {
        let tx_type = getTxType(this.stored_tx);
        checkStoredTx(this.stored_tx);
        this.sending_tx = JSON.parse(JSON.stringify(this.stored_tx));// deep copy
        switch (tx_type) {
            case Constants.OPC_TRANSACTION:
                this.sending_tx = getTransactionFields(this.sending_tx, this.sending_tx['transactionType']);
                break;
            case Constants.OPC_CONTRACT:
                getContractFields(this.sending_tx);
                break;
            case Constants.OPC_FUNCTION:
                getFunctionFields(this.sending_tx, this.stored_tx, this.stored_tx['functionIndex']);
                break;
        }
        this.sending_tx['signature'] = signature;
        return this.sending_tx;
    }

    toBytes() {
        let tx_type = getTxType(this.stored_tx);
        let field_type, function_type;
        checkStoredTx(this.stored_tx);
        this.cold_tx = JSON.parse(JSON.stringify(this.stored_tx));// deep copy
        switch (tx_type) {
            case Constants.OPC_TRANSACTION:
                field_type = this.stored_tx['transactionType'];
                return (TxUtil.toBytes((this.cold_tx),field_type));
            case Constants.OPC_CONTRACT:
                this.cold_tx['initData'] = processContractData(this.cold_tx['initData']);
                field_type = 8 & (255);
                return TxUtil.toBytes((this.cold_tx),field_type);
            case Constants.OPC_FUNCTION:
                function_type = this.stored_tx['functionIndex'];
                if ((function_type === Constants.SEND_FUNCIDX && this.stored_tx['attachment'] !== undefined) || function_type === Constants.SEND_FUNCIDX_SPLIT  ) {
                this.cold_tx['functionData'] = processFunctionData(this.cold_tx['functionData'], 'SEND');
                } else {
                this.cold_tx['attachment'] = '';
                this.cold_tx['functionData'] = processFunctionData(this.cold_tx['functionData'], function_string_type[function_type]);
                }
                field_type = 9 & (255);
                return TxUtil.toBytes((this.cold_tx),field_type);
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
