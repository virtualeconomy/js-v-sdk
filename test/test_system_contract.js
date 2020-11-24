const Transaction = require('../libs/transaction').default;
const Account = require('../libs/account').default;
const Blockchain = require('../libs/blockchain').default;
const { SystemContractDataGenerator, getContractFunctionIndex } = require('../libs/data');
const constants = require("../libs/constants");
const contract_1 = require("../libs/contract");
const contract_type = require("../libs/contract_type");
const test_config = require('../libs/test_config');
const convert = require('../libs/utils/convert').default;
const common = require('../libs/utils/common').default;
const expect = require("chai").expect;
const network_byte = constants.TESTNET_BYTE;
const host_ip = 'http://test.v.systems:9922';
const BigNumber = require('bignumber.js').default;
/*======= Change the below before run ==========*/
const recipient = "AUEMZKy23xvWixKySNDg448dXxwc4GEZCC3";
const system_token_id = contract_1.SYSTEM_CONTRACT_TOKEN_ID_TEST;
const vsys_payment_contract_id = 'CEv9x9T7iAk6Jo4sowdtyjf3aetTFpmzLth';
/*================ Change end ==================*/

async function sendExecuteContractTxByChain(tx) {
    const result = await chain.sendExecuteContractTx(tx);
    return result;
}

async function sendExecuteContractTxByAccount(tx) {
    let acc = new Account(network_byte);
    const result = await acc.sendTransaction(chain, tx);
    return result;
}

const chain = new Blockchain(host_ip, network_byte);

// test deposit vsys token
describe('test deposit vsys token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new SystemContractDataGenerator();

    // Necessary data for deposit vsys token
    // smart_contract must be PAYMENT_CONTRACT or LOCK_CONTRACT
    let system_contract = common.tokenIDToContractID(system_token_id)
    let public_key = acc.getPublicKey();
    let sender = address
    let amount = 1;
    let smart_contract = vsys_payment_contract_id;
    let function_data = data_generator.createDepositData(sender, smart_contract, amount);
    let attachment = 'deposit VSYS';
    let timestamp = Date.now() * 1e6;
    let function_index = getContractFunctionIndex(contract_type.SYSTEM, 'DEPOSIT');

    // Result of deposit vsys token
    let contract_tx = tra.buildExecuteContractTx(public_key, system_contract, function_index, function_data, timestamp, attachment);
    it('get deposit vsys token Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.SYSTEM_CONTRACT_DEPOSIT_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(smart_contract).to.be.equal(parse_function_data[1]['data']);
    });
    it('get json for sending tx (deposit vsys token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(system_contract);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (deposit vsys token) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(system_contract);
        expect(result['functionIndex']).to.be.equal(constants.SYSTEM_CONTRACT_DEPOSIT_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (deposit vsys token) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(system_contract);
        expect(result['functionIndex']).to.be.equal(constants.SYSTEM_CONTRACT_DEPOSIT_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (deposit vsys token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(system_contract);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.SYSTEM_CONTRACT_DEPOSIT_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test withdraw vsys token
describe('test withdraw vsys token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new SystemContractDataGenerator();

    // Necessary data for withdraw vsys token
    let public_key = acc.getPublicKey();
    let system_contract = common.tokenIDToContractID(system_token_id);
    let recipient = address;
    let smart_contract = vsys_payment_contract_id;
    let amount = 1;
    let function_data = data_generator.createWithdrawData(smart_contract, recipient, amount);
    let attachment = 'withdraw vsys';
    let timestamp = Date.now() * 1e6;
    let function_index = getContractFunctionIndex(contract_type.SYSTEM, 'WITHDRAW');

    // Result of withdraw vsys token
    // smart_contract must be PAYMENT_CONTRACT or LOCK_CONTRACT
    let contract_tx = tra.buildExecuteContractTx(public_key, system_contract, function_index, function_data, timestamp, attachment);
    it('get withdraw vsys token Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.SYSTEM_CONTRACT_WITHDRAW_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(smart_contract).to.be.equal(parse_function_data[0]['data']);
    });
    it('get json for sending tx (withdraw vsys token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(system_contract);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (withdraw vsys token) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(system_contract);
        expect(result['functionIndex']).to.be.equal(constants.SYSTEM_CONTRACT_WITHDRAW_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (withdraw vsys token) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(system_contract);
        expect(result['functionIndex']).to.be.equal(constants.SYSTEM_CONTRACT_WITHDRAW_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (withdraw vsys token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(system_contract);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.SYSTEM_CONTRACT_WITHDRAW_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test transfer vsys token
describe('test transfer vsys token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new SystemContractDataGenerator();

    // Necessary data for transfer vsys token
    let public_key = acc.getPublicKey();
    let system_contract = common.tokenIDToContractID(system_token_id);
    let sender = address;
    let recipient = 'AUEMZKy23xvWixKySNDg448dXxwc4GEZCC3';
    let timestamp = Date.now() * 1e6;
    let amount = 1;
    let function_data = data_generator.createTransferData(sender, recipient, amount);
    let attachment = 'transfer vsys';
    let function_index = getContractFunctionIndex(contract_type.SYSTEM, 'TRANSFER');

    // Result of transfer vsys token
    let contract_tx = tra.buildExecuteContractTx(public_key, system_contract, function_index, function_data, timestamp, attachment);
    it('get transfer vsys token Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.SYSTEM_CONTRACT_TRANSFER_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(recipient).to.be.equal(parse_function_data[1]['data']);
        expect(BigNumber(amount).multipliedBy(1e8).toString()).to.be.equal(parse_function_data[2]['data'].toString());
    });
    it('get json for sending tx (transfer vsys token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(system_contract);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
        expect(send_tx['attachment']).to.not.be.empty;
    });

    it('get send execute contractTx result (transfer vsys token) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(system_contract);
        expect(result['functionIndex']).to.be.equal(constants.SYSTEM_CONTRACT_TRANSFER_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
        expect(result['attachment']).to.not.be.empty;
    });

    it('get send execute contractTx result (transfer vsys token) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(system_contract);
        expect(result['functionIndex']).to.be.equal(constants.SYSTEM_CONTRACT_TRANSFER_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
        expect(result['attachment']).to.not.be.empty;
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (transfer vsys token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(system_contract);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.SYSTEM_CONTRACT_TRANSFER_FUNCIDX);
        expect(cold_tx['function']).to.to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test send vsys token
describe('test send vsys token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new SystemContractDataGenerator();

    // Necessary data for send vsys token
    let public_key = acc.getPublicKey();
    let system_contract = common.tokenIDToContractID(system_token_id);
    let recipient = 'AUEMZKy23xvWixKySNDg448dXxwc4GEZCC3';
    let timestamp = Date.now() * 1e6;
    let amount = 1;
    let function_data = data_generator.createSendData(recipient, amount);
    let attachment = 'send vsys';
    let function_index = getContractFunctionIndex(contract_type.SYSTEM, 'SEND');

    // Result of send vsys token
    let contract_tx = tra.buildExecuteContractTx(public_key, system_contract, function_index, function_data, timestamp, attachment);
    it('get send vsys token Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.SYSTEM_CONTRACT_SEND_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(recipient).to.be.equal(parse_function_data[0]['data']);
        expect(BigNumber(amount).multipliedBy(1e8).toString()).to.be.equal(parse_function_data[1]['data'].toString());
    });
    it('get json for sending tx (send vsys token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(system_contract);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (send vsys token) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(system_contract);
        expect(result['functionIndex']).to.be.equal(constants.SYSTEM_CONTRACT_SEND_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
        expect(result['attachment']).to.not.be.empty;
    });

    it('get send execute contractTx result (send vsys token) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(system_contract);
        expect(result['functionIndex']).to.be.equal(constants.SYSTEM_CONTRACT_SEND_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
        expect(result['attachment']).to.not.be.empty;
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (send vsys token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(system_contract);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.SYSTEM_CONTRACT_SEND_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});
