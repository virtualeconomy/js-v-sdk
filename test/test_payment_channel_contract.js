const Transaction = require('../libs/transaction').default;
const Account = require('../libs/account').default;
const Blockchain = require('../libs/blockchain').default;
const { PaymentChannelContractDataGenerator, getContractFunctionIndex } = require('../libs/data');
const constants = require("../libs/constants");
const contract_1 = require("../libs/contract");
const contract_type = require("../libs/contract_type");
const test_config = require('../libs/test_config');
const convert = require('../libs/utils/convert').default;
const expect = require("chai").expect;
const network_byte = constants.TESTNET_BYTE;
const host_ip = 'http://test.v.systems:9922';
const BigNumber = require('bignumber.js').default;
/*======= Change the below before run ==========*/
const test_recipient = "AUEMZKy23xvWixKySNDg448dXxwc4GEZCC3";
const system_token_id = contract_1.SYSTEM_CONTRACT_TOKEN_ID_TEST;
const related_token_unity = 1e8;
const test_channel_id = 'F1sVCsT2KdCYF7jj3pboFkLsdaEuoP1wPWDqSAM39bYy';
const test_transaction_signature = '';
const test_payment_contract_id = 'CFCLjuoCqS5uh4PeNntA8sZYipRgrvwZrhm';
const expiration_day = '2020-12-31'
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
const data_generator = new PaymentChannelContractDataGenerator();

// test createAndLoad
describe('test createAndLoad', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for createAndLoad
    let contract_id = test_payment_contract_id
    let public_key = acc.getPublicKey();
    let recipient = test_recipient;
    let amount = 10;
    let unity = related_token_unity
    let expiration_time = Date.parse(expiration_day) * 1e6;
    let function_data = data_generator.createCreateAndLoadData(recipient, amount, unity, expiration_time);
    let attachment = 'create and load';
    let timestamp = Date.now() * 1e6;
    let function_index = getContractFunctionIndex(contract_type.PAYMENT_CHANNEL, 'CREATEANDLOAD');

    // Result of createAndLoad
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get createAndLoad Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_CREATEANDLOAD_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(BigNumber(amount).multipliedBy(unity).toString()).to.be.equal(parse_function_data[1]['data'].toString());
        expect(recipient).to.be.equal(parse_function_data[0]['data']);
        expect(expiration_time).to.be.equal(parse_function_data[2]['data']);
    });
    it('get json for sending tx (createAndLoad)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (createAndLoad) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_CREATEANDLOAD_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (createAndLoad) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_CREATEANDLOAD_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (createAndLoad)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_CREATEANDLOAD_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test extendExpirationTime
describe('test extendExpirationTime', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for extendExpirationTime
    let contract_id = test_payment_contract_id
    let public_key = acc.getPublicKey();
    let channel_id = test_channel_id
    let expiration_time = Date.parse(expiration_day) * 1e6;
    let function_data = data_generator.createExtendExpirationTimeData(channel_id, expiration_time);
    let attachment = 'entend expiration time';
    let timestamp = Date.now() * 1e6;
    let function_index = getContractFunctionIndex(contract_type.PAYMENT_CHANNEL, 'EXTENDEXPIRATIONTIME');

    // Result of extendExpirationTime
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get extendExpirationTime Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_EXTENDEXPIRATIONTIME_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(channel_id).to.be.equal(parse_function_data[0]['data']);
        expect(expiration_time).to.be.equal(parse_function_data[1]['data']);
    });
    it('get json for sending tx (extendExpirationTime)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (extendExpirationTime) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_EXTENDEXPIRATIONTIME_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (extendExpirationTime) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_EXTENDEXPIRATIONTIME_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (extendExpirationTime)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_EXTENDEXPIRATIONTIME_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test load
describe('test load', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for load
    let contract_id = test_payment_contract_id
    let public_key = acc.getPublicKey();
    let channel_id = test_channel_id;
    let amount = 10;
    let unity = related_token_unity;
    let function_data = data_generator.createLoadData(channel_id, amount, unity);
    let attachment = 'load';
    let timestamp = Date.now() * 1e6;
    let function_index = getContractFunctionIndex(contract_type.PAYMENT_CHANNEL, 'LOAD');

    // Result of load
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get load Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_LOAD_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(channel_id).to.be.equal(parse_function_data[0]['data']);
        expect(BigNumber(amount).multipliedBy(unity).toString()).to.be.equal(parse_function_data[1]['data'].toString());
    });
    it('get json for sending tx (load)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (load) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_LOAD_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (load) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_LOAD_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (load)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_LOAD_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test abort
describe('test abort', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for abort
    let contract_id = test_payment_contract_id
    let public_key = acc.getPublicKey();
    let channel_id = test_channel_id;
    let function_data = data_generator.createAbortData(channel_id);
    let attachment = 'abort';
    let timestamp = Date.now() * 1e6;
    let function_index = getContractFunctionIndex(contract_type.PAYMENT_CHANNEL, 'ABORT');

    // Result of abort
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get abort Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_ABORT_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(channel_id).to.be.equal(parse_function_data[0]['data']);
    });
    it('get json for sending tx (abort)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (abort) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_ABORT_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (abort) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_ABORT_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (abort)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_ABORT_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test unload
describe('test unload', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for unload
    let contract_id = test_payment_contract_id
    let public_key = acc.getPublicKey();
    let channel_id = test_channel_id;
    let function_data = data_generator.createUnloadData(channel_id);
    let attachment = 'unload';
    let timestamp = Date.now() * 1e6;
    let function_index = getContractFunctionIndex(contract_type.PAYMENT_CHANNEL, 'UNLOAD');

    // Result of unload
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get unload Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_UNLOAD_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(channel_id).to.be.equal(parse_function_data[0]['data']);
    });
    it('get json for sending tx (unload)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (unload) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_UNLOAD_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (unload) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_UNLOAD_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (unload)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_UNLOAD_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test collect payment
describe('test collect payment', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for collect payment
    let contract_id = test_payment_contract_id;
    let public_key = acc.getPublicKey();
    let channel_id = test_channel_id;
    let amount = 10;
    let unity = related_token_unity;
    let transaction_signature = test_transaction_signature;
    let function_data = data_generator.createCollectPaymentData(channel_id, amount, unity, transaction_signature);
    let attachment = 'collect payment';
    let timestamp = Date.now() * 1e6;
    let function_index = getContractFunctionIndex(contract_type.PAYMENT_CHANNEL, 'COLLECTPAYMENT');

    // Result of collect payment
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get collect payment Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_COLLECTPAYMENT_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(channel_id).to.be.equal(parse_function_data[0]['data']);
    });
    it('get json for sending tx (collect payment)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (collect payment) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_COLLECTPAYMENT_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (collect payment) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_COLLECTPAYMENT_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (collect payment)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.PAYMENTCHANNEL_CONTRACT_COLLECTPAYMENT_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});
