"use strict";

// Object.defineProperty(exports, "__esModule", { value: true });

// import "babel-polyfill";
import QRCode from 'qrcode'
import BigNumber from 'bignumber.js';
import Account from './account';
import Convert from './utils/convert';
import Base58 from 'base-58';
import { TokenContractDataGenerator } from './data';
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
        case Contract.NON_FUNGIBLE_TOKEN_CONTRACT:
            return 'NON_FUNGIBLE_TOKEN_CONTRACT';
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

function processData(data) {
    let num = data.length
    let encode_arr = Convert.shortToByteArray(num);
    for (let i=0; i<num; i++) {
        encode_arr = encode_arr.concat(Common.getDataBytes(data[i]['value'], data[i]['type']))
    }
    return Base58.encode(Uint8Array.from(encode_arr))
}

// Fields-process functions for cold signature
function getContractColdFields(cold_tx, network_byte, acc) {
    let init_data = cold_tx['initData'];
    let public_key_bytes = Base58.decode(cold_tx['senderPublicKey']);
    cold_tx['address'] = acc.convertPublicKeyToAddress(public_key_bytes, network_byte);
    cold_tx['contractInit'] = processData(init_data);
    delete cold_tx['senderPublicKey'];
    delete cold_tx['initData'];
}

function getFunctionColdFields(cold_tx, network_byte, acc) {
    let init_data = cold_tx['functionData'];
    cold_tx['function'] = processData(init_data);
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

    buildGenesisTx(public_key, recipient, amount, slotId, timestamp) {
        if (!timestamp) {
            timestamp = Date.now() * 1e6;
        }
        let tx = {
            senderPublicKey: public_key,
            recipient: recipient,
            amount: convertAmountToMinimumUnit(amount),
            slotId: slotId,
            timestamp: timestamp,
            transactionType: Constants.GENESIS_TX
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
        let data_generator = new TokenContractDataGenerator()
        let function_data = data_generator.createSendData(recipient, amount, unity)
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
                this.sending_tx['initData'] = processData(this.sending_tx['initData'])
                break;
            case Constants.OPC_FUNCTION:
                this.sending_tx['functionData'] = processData(this.sending_tx['functionData'])
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
                this.cold_tx['initData'] = processData(this.cold_tx['initData']);
                field_type = 8 & (255);
                return TxUtil.toBytes((this.cold_tx),field_type);
            case Constants.OPC_FUNCTION:
                this.cold_tx['functionData'] = processData(this.cold_tx['functionData'])
                field_type = 9 & (255);
                return TxUtil.toBytes((this.cold_tx),field_type);
        }
    }

    buildTransactionId(data_bytes) {
        if (!data_bytes || !(data_bytes instanceof Uint8Array)) {
            data_bytes = this.toBytes()
        }
        let output = new Uint8Array(32);
        Blake2b(output.length).update(data_bytes).digest(output);
        let hash = output;
        return Base58.encode(hash);
    }
};
