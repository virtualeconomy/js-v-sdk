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

function getContractType(contract) {
    switch (contract) {
        case Contract.TOKEN_CONTRACT:
            return 'TOKEN_CONTRACT';
        case Contract.TOKEN_CONTRACT_WITH_SPLIT:
            return 'TOKEN_CONTRACT_WITH_SPLIT';
        case Contract.PAYMENT_CONTRACT:
            return 'PAYMENT_CONTRACT';
        case Contract.LOCK_CONTRACT:
            return 'LOCK_CONTRACT';
        default:
            throw new Error('Invalid contract! ')
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

function processAttachment(description) {
    return Base58.encode(Convert.stringToByteArray(description));
}

function data_bytes_gen(data, data_type) {
    let data_bytes;
    switch (data_type) {
        case Constants.AMOUNT_TYPE:
            data_bytes = Convert.bigNumberToByteArray(data);
            break;
        case Constants.SHORTTEXT_TYPE:
            let byte_arr = Convert.stringToByteArray(data);
            let length = byte_arr.length;
            let length_arr = Convert.shortToByteArray(length);
            data_bytes = length_arr.concat(byte_arr)
            break;
        case Constants.TOKEN_ID_TYPE:
            let token_id_arr = Base58.decode(data);
            data_bytes = Array.from(token_id_arr);
            break;
        case Constants.ACCOUNT_ADDR_TYPE:
            let account_arr = Base58.decode(data);
            data_bytes = Array.from(account_arr);
            break;
        case Constants.CONTRACT_ACCOUNT_TYPE:
            let contract_account_arr = Base58.decode(data);
            data_bytes = Array.from(contract_account_arr);
    }
    return [data_type].concat(data_bytes);
}

// Data process function for registering contract
function processContractData(init_data, contract_type) {
    switch (contract_type) {
        case 'TOKEN_CONTRACT': case 'TOKEN_CONTRACT_WITH_SPLIT':
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
            let max_arr = data_bytes_gen(max, Constants.AMOUNT_TYPE);
            let unity_arr = data_bytes_gen(unity, Constants.AMOUNT_TYPE);
            let des_arr = data_bytes_gen(token_description, Constants.SHORTTEXT_TYPE);
            let parameters_num = Convert.shortToByteArray(3);
            let encode_arr = parameters_num.concat(max_arr.concat(unity_arr.concat(des_arr)));
            return Base58.encode(encode_arr);
        case 'PAYMENT_CONTRACT': case 'LOCK_CONTRACT':
            if(!init_data.hasOwnProperty('token_id')) {
                throw new Error("There is no field 'token_id' in initData");
            }
            parameters_num = Convert.shortToByteArray(1);
            let token_id_arr = data_bytes_gen(init_data['token_id'], Constants.TOKEN_ID_TYPE);
            encode_arr = parameters_num.concat(token_id_arr)
            return Base58.encode(encode_arr)
    }
}

function processFunctionData(init_data) {
    if (!init_data.hasOwnProperty('function_index_type')) {
        throw new Error("There is no field 'function_index_type' in functionData");
    }
    let function_index_type = init_data['function_index_type'];
    let parameters_num,encode_arr,amount,unity,account_arr,amount_arr;
    switch (function_index_type) {
        case Constants.ISSUE_FUNCIDX_TYPE: case Constants.DESTROY_FUNCIDX_TYPE:
            if(!init_data.hasOwnProperty('amount')) {
                throw new Error("There is no field 'amount' in functionData");
            }
            if(!init_data.hasOwnProperty('unity')) {
                throw new Error("There is no field 'unity' in functionData");
            }
            amount = init_data['amount'];
            unity = init_data['unity'];
            amount_arr = data_bytes_gen(BigNumber(amount).multipliedBy(unity), Constants.AMOUNT_TYPE);
            parameters_num = Convert.shortToByteArray(1);
            encode_arr = parameters_num.concat(amount_arr);
            return Base58.encode(Uint8Array.from(encode_arr));
        case Constants.SUPERSEDE_FUNCIDX_TYPE:
            if(!init_data.hasOwnProperty('new_issuer')) {
                throw new Error("There is no field 'new_issuer' in functionData");
            }
            let new_issuer = init_data['new_issuer'];
            account_arr = data_bytes_gen(new_issuer, Constants.ACCOUNT_ADDR_TYPE);
            parameters_num = Convert.shortToByteArray(1);
            encode_arr = parameters_num.concat(account_arr);
            return Base58.encode(Uint8Array.from(encode_arr));
        case Constants.SPLIT_FUNCIDX_TYPE:
            if(!init_data.hasOwnProperty('new_unity')) {
                throw new Error("There is no field 'new_unity' in functionData");
            }
            let new_unity = BigNumber(init_data['new_unity']);
            let unity_arr = data_bytes_gen(new_unity, Constants.AMOUNT_TYPE)
            parameters_num = Convert.shortToByteArray(1);
            encode_arr = parameters_num.concat(unity_arr);
            return Base58.encode(Uint8Array.from(encode_arr));
        case Constants.SEND_FUNCIDX_TYPE:
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
            account_arr = data_bytes_gen(recipient, Constants.ACCOUNT_ADDR_TYPE);
            amount_arr = data_bytes_gen(amount, Constants.AMOUNT_TYPE);
            parameters_num = Convert.shortToByteArray(2);
            encode_arr = parameters_num.concat(account_arr.concat(amount_arr));
            return Base58.encode(Uint8Array.from(encode_arr));
        case Constants.TRANSFER_FUNCIDX_TYPE:
            if(!init_data.hasOwnProperty('recipient')) {
                throw new Error("There is no field 'recipient' in functionData");
            }
            if(!init_data.hasOwnProperty('amount')) {
                throw new Error("There is no field 'amount' in functionData");
            }
            if(!init_data.hasOwnProperty('unity')) {
                throw new Error("There is no field 'unity' in functionData");
            }
            if(!init_data.hasOwnProperty('sender')) {
                throw new Error("There is no field 'sender' in functionData");
            }
            let sender = init_data['sender']
            let sender_arr = data_bytes_gen(sender, Constants.ACCOUNT_ADDR_TYPE);
            recipient = init_data['recipient'];
            let recipient_arr = data_bytes_gen(recipient, Constants.ACCOUNT_ADDR_TYPE);
            amount = BigNumber(init_data['amount']).multipliedBy(init_data['unity']);
            amount_arr = data_bytes_gen(amount, Constants.AMOUNT_TYPE);
            parameters_num = Convert.shortToByteArray(3);
            encode_arr = parameters_num.concat(sender_arr.concat(recipient_arr.concat(amount_arr)));
            return Base58.encode(Uint8Array.from(encode_arr));
        case Constants.DEPOSIT_FUNCIDX_TYPE:
            if(!init_data.hasOwnProperty('smart_contract')) {
                throw new Error("There is no field 'smart_contract' in functionData");
            }
            if(!init_data.hasOwnProperty('amount')) {
                throw new Error("There is no field 'amount' in functionData");
            }
            if(!init_data.hasOwnProperty('unity')) {
                throw new Error("There is no field 'unity' in functionData");
            }
            if(!init_data.hasOwnProperty('sender')) {
                throw new Error("There is no field 'sender' in functionData");
            }
            sender = init_data['sender'];
            sender_arr = data_bytes_gen(sender, Constants.ACCOUNT_ADDR_TYPE);
            let smart_contract = init_data['smart_contract'];
            let smart_contract_arr = data_bytes_gen(smart_contract, Constants.CONTRACT_ACCOUNT_TYPE);
            amount = BigNumber(init_data['amount']).multipliedBy(init_data['unity']);
            amount_arr = data_bytes_gen(amount, Constants.AMOUNT_TYPE);
            parameters_num = Convert.shortToByteArray(3);
            encode_arr = parameters_num.concat(sender_arr.concat(smart_contract_arr.concat(amount_arr)));
            return Base58.encode(Uint8Array.from(encode_arr));
        case Constants.WITHDRAW_FUNCIDX_TYPE:
            if(!init_data.hasOwnProperty('smart_contract')) {
                throw new Error("There is no field 'smart_contract' in functionData");
            }
            if(!init_data.hasOwnProperty('amount')) {
                throw new Error("There is no field 'amount' in functionData");
            }
            if(!init_data.hasOwnProperty('unity')) {
                throw new Error("There is no field 'unity' in functionData");
            }
            if(!init_data.hasOwnProperty('recipient')) {
                throw new Error("There is no field 'recipient' in functionData");
            }
            recipient = init_data['recipient'];
            recipient_arr = data_bytes_gen(recipient, Constants.ACCOUNT_ADDR_TYPE);
            smart_contract = init_data['smart_contract'];
            smart_contract_arr = data_bytes_gen(smart_contract, Constants.CONTRACT_ACCOUNT_TYPE);
            amount = BigNumber(init_data['amount']).multipliedBy(init_data['unity']);
            amount_arr = data_bytes_gen(amount, Constants.AMOUNT_TYPE);
            parameters_num = Convert.shortToByteArray(3);
            encode_arr = parameters_num.concat(smart_contract_arr.concat(recipient_arr.concat(amount_arr)));
            return Base58.encode(Uint8Array.from(encode_arr));
    }
}

// Fields-process functions for cold signature
function getContractColdFields(cold_tx, network_byte, acc) {
    let init_data = cold_tx['initData'];
    let public_key_bytes = Base58.decode(cold_tx['senderPublicKey']);
    cold_tx['address'] = acc.convertPublicKeyToAddress(public_key_bytes, network_byte);
    let contract_type = getContractType(cold_tx['contract']);
    switch (contract_type) {
        case 'TOKEN_CONTRACT': case 'TOKEN_CONTRACT_WITH_SPLIT':
            if(!init_data.hasOwnProperty('amount')) {
                throw new Error("There is no field 'amount' in initData");
            }
            if(!init_data.hasOwnProperty('unity')) {
                throw new Error("There is no field 'unity' in initData");
            }
            if(!init_data.hasOwnProperty('token_description')) {
                throw new Error("There is no field 'token_description' in initData");
            }
            cold_tx['contractInitExplain'] = 'Create token' + (contract_type === 'TOKEN_CONTRACT' ? ' ' : ' (support split) ') + 'with max supply ' + BigNumber(init_data['amount']);
            cold_tx['contractInitTextual'] = "init(max=" + BigNumber(init_data['amount']) + ",unity= "+ BigNumber(init_data['unity']) + ",tokenDescription='" + init_data['token_description'] + "')";
            break;
        case 'PAYMENT_CONTRACT': case 'LOCK_CONTRACT':
            cold_tx['contractInitExplain'] = ''
            cold_tx['contractInitTextual'] = ''
    }
    cold_tx['contractInit'] = processContractData(init_data, contract_type);
    delete cold_tx['senderPublicKey'];
    delete cold_tx['initData'];
}

function getFunctionColdFields(cold_tx, network_byte, acc) {
    let init_data = cold_tx['functionData'];
    cold_tx['function'] = processFunctionData(init_data)
    let function_index_type = init_data['function_index_type'];
    switch (function_index_type) {
        case Constants.SUPERSEDE_FUNCIDX_TYPE:
            cold_tx['functionExplain'] = 'Set issuer to ' + init_data['new_issuer'];
            break;
        case Constants.ISSUE_FUNCIDX_TYPE:
            cold_tx['functionExplain'] = 'Issue ' + init_data['amount'] + ' Token';
            break;
        case Constants.DESTROY_FUNCIDX_TYPE:
            cold_tx['functionExplain'] = 'Destroy ' + init_data['amount'] + ' Token';
            break;
        case Constants.SPLIT_FUNCIDX_TYPE:
            cold_tx['functionExplain'] = 'Set token unity to ' + init_data['new_unity'];
            break;
        case Constants.SEND_FUNCIDX_TYPE:
            cold_tx['functionExplain'] = 'Send ' + init_data['amount'] + ' token to ' + init_data['recipient'];
            break;
        case Constants.TRANSFER_FUNCIDX_TYPE:
            cold_tx['functionExplain'] = 'Transfer ' + init_data['amount'] + ' token from ' + init_data['sender'] + ' to ' + init_data['recipient'];
            break;
        case Constants.DEPOSIT_FUNCIDX_TYPE:
            cold_tx['functionExplain'] = 'Deposit Token';
            break;
        case Constants.WITHDRAW_FUNCIDX_TYPE:
            cold_tx['functionExplain'] = 'Withdraw Token';
            break;
    }
    let public_key_bytes = Base58.decode(cold_tx['senderPublicKey']);
    cold_tx['attachment'] = processAttachment(cold_tx['attachment']);
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
        fee = typeof fee !== 'undefined' ? fee : Constants.CONTRACT_EXEC_FEE;
        attachment = typeof attachment === 'undefined' ? '' : attachment;
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
        let function_index_type = Constants.SEND_FUNCIDX_TYPE;
        let function_data = {recipient, amount, unity, function_index_type};
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
                getFunctionColdFields(this.cold_tx, this.network_byte, this.acc);
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
                let contract_type = getContractType(this.sending_tx['contract']);
                this.sending_tx['initData'] = processContractData(this.sending_tx['initData'], contract_type)
                break;
            case Constants.OPC_FUNCTION:
                this.sending_tx['functionData'] = processFunctionData(this.sending_tx['functionData'])
                this.sending_tx['attachment'] = processAttachment(this.sending_tx['attachment']);
                break;
        }
        this.sending_tx['signature'] = signature;
        return this.sending_tx;
    }

    toBytes() {
        let tx_type = getTxType(this.stored_tx);
        let field_type;
        checkStoredTx(this.stored_tx);
        this.cold_tx = JSON.parse(JSON.stringify(this.stored_tx));// deep copy
        switch (tx_type) {
            case Constants.OPC_TRANSACTION:
                field_type = this.stored_tx['transactionType'];
                return (TxUtil.toBytes((this.cold_tx),field_type));
            case Constants.OPC_CONTRACT:
                let contract_type = getContractType(this.cold_tx['contract']);
                this.cold_tx['initData'] = processContractData(this.cold_tx['initData'], contract_type);
                field_type = 8 & (255);
                return TxUtil.toBytes((this.cold_tx),field_type);
            case Constants.OPC_FUNCTION:
                this.cold_tx['functionData'] = processFunctionData(this.cold_tx['functionData'])
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
