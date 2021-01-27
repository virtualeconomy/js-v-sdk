"use strict";

// import "babel-polyfill";
import Fetch from 'node-fetch';
import Common from './utils/common';

async function getRequest(host, path) {
    const url = host + path;
    const config = {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    }
    const response = await Fetch(url, config);
    return await response.text();
}

async function getRequestWithKey(host, path, key) {
    const url = host + path;
    const config = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'api_key': key
        }
    }
    const response = await Fetch(url, config);
    return await response.text();
}

async function postRequest (url, tx) {
    const jsonData = JSON.stringify(tx).replace(/"amount":"(\d+)"/g, '"amount":$1');
    const config = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: jsonData
    }
    const response = await Fetch(url, config);
    return await response.text();
}

function textToSafeJson(str, keys) {
    if (keys) {
        for (let i = 0; i < keys.length; i++) {
            let temp = '"' + keys[i] + '"';
            let reg = new RegExp( temp + ' :\\s*(-?\\d+)', 'g');
            str = str.replace(reg, temp + ' : "$1"');
        }
    }
    return JSON.parse(str);
}

export default class Blockchain {

    constructor(host_ip, network_byte, api_key = '') {
        this.network_byte = network_byte;
        this.host_ip = host_ip;
        this.api_key = api_key;
    }

    async getBalance(address) {
        let response = await getRequest(this.host_ip, '/addresses/balance/' + address);
        let keys = ['balance'];
        return textToSafeJson(response, keys);
    }

    async getBalanceDetail(address) {
        let response = await getRequest(this.host_ip, '/addresses/balance/details/' + address);
        let keys = ['regular', 'mintingAverage', 'available', 'effective'];
        return textToSafeJson(response, keys);
    }

    async getTxHistory(address, num) {
        let response = await getRequest(this.host_ip, '/transactions/address/' + address + '/limit/' + num);
        let keys = ['amount'];
        return textToSafeJson(response, keys);
    }

    async getActiveLeaseList(address) {
        let response = await getRequestWithKey(this.host_ip, '/transactions/activeLeaseList/' + address, this.api_key);
        let keys = ['amount'];
        return textToSafeJson(response, keys);
    }

    async getTxById(tx_id) {
        let response = await getRequest(this.host_ip, '/transactions/info/' + tx_id);
        let keys = ['amount'];
        return textToSafeJson(response, keys);
    }

    async getTxByType(address, record_limit, type, offset = 0) {
        let response = await getRequest(this.host_ip, '/transactions/list?address=' + address + '&limit=' + record_limit + '&txType=' + type + '&offset=' + offset);
        let keys =['amount'];
        return textToSafeJson(response, keys);
    }

    async getTxCount(address, type) {
        let response = await getRequest(this.host_ip, '/transactions/count?address=' + address + '&txType=' + type);
        return textToSafeJson(response);
    }

    async getUnconfirmedTxById(tx_id) {
        let response = await getRequest(this.host_ip, '/transactions/unconfirmed/info/' + tx_id);
        return textToSafeJson(response);
    }

    async getHeight() {
        let response = await getRequest(this.host_ip, '/blocks/height');
        return textToSafeJson(response);
    }

    async getLastBlock() {
        let response = await getRequest(this.host_ip, '/blocks/last');
        let keys = ['mintBalance', 'amount'];
        return textToSafeJson(response, keys);
    }

    async getBlockByHeight(height) {
        let response = await getRequest(this.host_ip, '/blocks/at/' + height);
        let keys = ['mintBalance', 'amount'];
        return textToSafeJson(response, keys);
    }

    async getSlotInfo(slot_id) {
        let response = await getRequest(this.host_ip, '/consensus/slotInfo/' + slot_id);
        let keys = ['mintingAverageBalance'];
        return textToSafeJson(response, keys);
    }

    async getAllSlotsInfo() {
        let response = await getRequest(this.host_ip, '/consensus/allSlotsInfo');
        let keys = ['mintingAverageBalance'];
        return textToSafeJson(response, keys);
    }

    async getTokenInfo(token_id) {
        let response = await getRequest(this.host_ip, '/contract/tokenInfo/' + token_id);
        let keys = ['max', 'total', 'unity'];
        return textToSafeJson(response, keys);
    }

    async getTokenBalance(address, token_id) {
        let response = await getRequest(this.host_ip, '/contract/balance/' + address + '/' + token_id);
        let keys = ['balance', 'unity'];
        return textToSafeJson(response, keys);
    }

    async getContractInfo(contract_id) {
        let response = await getRequest(this.host_ip, '/contract/info/' + contract_id);
        return textToSafeJson(response);
    }

    async getContractContent(contract_id) {
        let response = await getRequest(this.host_ip, '/contract/content/' + contract_id);
        return textToSafeJson(response);
    }

    async getContractData(contract_id, state_index, data_type, data) {
        let key_string = Common.getContractKeyString(state_index, data_type, data);
        let response = await getRequest(this.host_ip, '/contract/data/' + contract_id + '/' + key_string);
        return textToSafeJson(response);
    }

    async getLastTokenIndex(contract_id) {
        let response = await getRequest(this.host_ip, '/contract/lastTokenIndex/' + contract_id);
        return textToSafeJson(response);
    }

    async sendPaymentTx(tx) {
        const url = this.host_ip + '/vsys/broadcast/payment';
        let response = await postRequest(url, tx);
        return textToSafeJson(response);
    }

    async sendLeasingTx(tx) {
        const url = this.host_ip + '/leasing/broadcast/lease';
        let response = await postRequest(url, tx);
        let keys = ['amount', 'unity'];
        return textToSafeJson(response, keys);
    }

    async sendCancelLeasingTx(tx) {
        const url = this.host_ip + '/leasing/broadcast/cancel';
        let response = await postRequest(url, tx);
        return textToSafeJson(response);
    }

    async sendRegisterContractTx(tx) {
        const url = this.host_ip + '/contract/broadcast/register';
        let response = await postRequest(url, tx);
        return textToSafeJson(response);
    }

    async sendExecuteContractTx(tx) {
        const url = this.host_ip + '/contract/broadcast/execute';
        let response = await postRequest(url, tx);
        return textToSafeJson(response);
    }
};
