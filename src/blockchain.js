"use strict";

import "babel-polyfill";
const fetch = require("node-fetch");

async function getRequest (host, path) {
    const url = host + path;
    const config = {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    }
    const response = await fetch(url, config)
    return await response.json();
}

module.exports = class Blockchain {

    constructor(host_ip, network_byte) {
        this.network_byte = network_byte;
        this.host_ip = host_ip;
    }

    async getBalance(address) {
        return await getRequest(this.host_ip, '/addresses/balance/' + address);
    }

    async getBalanceDetail(address) {
        return await getRequest(this.host_ip, '/addresses/balance/details/' + address);
    }

    async getTxHistory(address, num) {
        return await getRequest(this.host_ip, '/transactions/address/' + address + '/limit/' + num);
    }

    async getTxById(tx_id) {
        return await getRequest(this.host_ip, '/transactions/info/' + tx_id);
    }

    async getUnconfirmedTxById(tx_id) {
        return await getRequest(this.host_ip, '/transactions/unconfirmed/info/' + tx_id);
    }

    async getHeight() {
        return await getRequest(this.host_ip, '/blocks/height');
    }

    async getLastBlock() {
        return await getRequest(this.host_ip, '/blocks/last');
    }

    async getBlockByHeight(height) {
        return await getRequest(this.host_ip, '/blocks/at/' + height);
    }

    async getSlotInfo(slot_id) {
        return await getRequest(this.host_ip, '/consensus/slotInfo/' + slot_id);
    }

    async getAllSlotsInfo() {
        return await getRequest(this.host_ip, '/consensus/allSlotsInfo');
    }

    async getTokenInfo(token_id) {
        return await getRequest(this.host_ip, '/contract/tokenInfo/' + token_id);
    }

    async getTokenBalance(address, token_id) {
        return await getRequest(this.host_ip, '/contract/balance/' + address + '/' + token_id);
    }

    async getContractInfo(contract_id) {
        return await getRequest(this.host_ip, '/contract/info/' + contract_id);
    }

    async getContractContent(contract_id) {
        return await getRequest(this.host_ip, '/contract/content/' + contract_id);
    }
};
