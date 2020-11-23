const Transaction = require('../libs/transaction').default;
const Account = require('../libs/account').default;
const Blockchain = require('../libs/blockchain').default;
const { TokenContractDataGenerator, LockContractDataGenerator, PaymentChannelContractDataGenerator, NonFungibleTokenContractDataGenerator, getContractFunctionIndex } = require('../libs/data');
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
const recipient = "AUEMZKy23xvWixKySNDg448dXxwc4GEZCC3";
const test_new_unity = 100000000;
const test_issue_destroy_amount = 1;
const test_new_issuer = 'AUAztxsft2v6rmjRRb72nLea6BNyRHHWpUR';
const test_token_id = 'TWusvy35hepR6SKw7RM4zc3kX4DZ1FQsWEgf5S6XA';
const test_contract_id = 'CFENccDVaB6G6HKoXpJHisPPeUwbaaQQ1ZM';
const test_payment_contract_id = 'CFCLjuoCqS5uh4PeNntA8sZYipRgrvwZrhm'
/*================ Change end ==================*/

async function sendRegisterContractTxByChain(tx) {
    const result = await chain.sendRegisterContractTx(tx);
    return result;
}

async function sendRegisterContractTxByAccount(tx) {
    let acc = new Account(network_byte);
    const result = await acc.sendTransaction(chain, tx);
    return result;
}

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
// test CreateToken
describe('test create token', function () {
    this.timeout(5000);
    // Build account and transaction
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new TokenContractDataGenerator();

    // Necessary data for creating token
    let contract = contract_1.TOKEN_CONTRACT;
    let public_key = acc.getPublicKey();
    let amount = 9999;
    let unity = 100000000; // 1e8
    let token_description = 'token';
    let contract_description = 'contract';
    let timestamp = Date.now() * 1e6;
    let init_data = data_generator.createInitData(amount,unity,token_description);

    // Result
    let contractTx = tra.buildRegisterContractTx(public_key, contract, init_data, contract_description, timestamp);
    it('get register contractTx', function () {
        expect(contractTx).to.not.be.empty;
        expect(contractTx['contract']).to.be.a('string');
        expect(contractTx['senderPublicKey']).to.be.equal(public_key);
        expect(contractTx['description']).to.be.equal(contract_description);
        expect(contractTx['timestamp']).to.be.equal(timestamp);
    });
    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['initData']);
    let original_data = BigNumber(amount).multipliedBy(unity);
    it('unit test for parseFunctionData', function() {
        expect(original_data.toString()).to.be.equal(parse_function_data[0]['data'].toString());
        expect(token_description).to.be.equal(parse_function_data[2]['data']);
    });
    it('get json for sending tx', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['contract']).to.be.a('string');
        expect(send_tx['initData']).to.not.be.empty;
        expect(send_tx['signature']).to.not.be.empty;
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['description']).to.be.equal(contract_description);
    });

    it('get send register contractTx result by Chain', async() =>{
        let result = await sendRegisterContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['description']).to.be.equal(contract_description);
        expect(result['initData']).to.be.equal(send_tx['initData']);
    });

    it('get send register contractTx result by Account', async() =>{
        let result = await sendRegisterContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['description']).to.be.equal(contract_description);
        expect(result['initData']).to.be.equal(send_tx['initData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractInit']).to.be.equal(send_tx['initData']);
        expect(cold_tx['contract']).to.be.a('string');
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_CONTRACT);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
    });
});

// test register payment contract
describe('test register payment contract', function () {
    this.timeout(5000);
    // Build account and transaction
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new PaymentChannelContractDataGenerator();

    // Necessary data for registering payment contract
    let contract = contract_1.PAYMENT_CONTRACT;
    let public_key = acc.getPublicKey();
    let token_id = test_token_id;
    let contract_description = 'payment contract';
    let timestamp = Date.now() * 1e6;
    let init_data = data_generator.createInitData(token_id)

    // Result
    let contractTx = tra.buildRegisterContractTx(public_key, contract, init_data, contract_description, timestamp);
    it('get register contractTx', function () {
        expect(contractTx).to.not.be.empty;
        expect(contractTx['contract']).to.be.a('string');
        expect(contractTx['senderPublicKey']).to.be.equal(public_key);
        expect(contractTx['description']).to.be.equal(contract_description);
        expect(contractTx['timestamp']).to.be.equal(timestamp);
    });
    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['initData']);
    it('unit test for parseFunctionData', function() {
        expect(token_id).to.be.equal(parse_function_data[0]['data']);
    });
    it('get json for sending tx', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['contract']).to.be.a('string');
        expect(send_tx['initData']).to.not.be.empty;
        expect(send_tx['signature']).to.not.be.empty;
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['description']).to.be.equal(contract_description);
    });

    it('get send register contractTx result by Chain', async() =>{
        let result = await sendRegisterContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['description']).to.be.equal(contract_description);
        expect(result['initData']).to.be.equal(send_tx['initData']);
    });

    it('get send register contractTx result by Account', async() =>{
        let result = await sendRegisterContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['description']).to.be.equal(contract_description);
        expect(result['initData']).to.be.equal(send_tx['initData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractInit']).to.be.equal(send_tx['initData']);
        expect(cold_tx['contract']).to.be.a('string');
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_CONTRACT);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
    });
})

// test register lock contract
describe('test register lock contract', function () {
    this.timeout(5000);
    // Build account and transaction
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new LockContractDataGenerator()

    // Necessary data for registering lock contract
    let contract = contract_1.LOCK_CONTRACT;
    let public_key = acc.getPublicKey();
    let token_id = test_token_id;
    let contract_description = 'lock contract';
    let timestamp = Date.now() * 1e6;
    let init_data = data_generator.createInitData(token_id);

    // Result
    let contractTx = tra.buildRegisterContractTx(public_key, contract, init_data, contract_description, timestamp);
    it('get register contractTx', function () {
        expect(contractTx).to.not.be.empty;
        expect(contractTx['contract']).to.be.a('string');
        expect(contractTx['senderPublicKey']).to.be.equal(public_key);
        expect(contractTx['description']).to.be.equal(contract_description);
        expect(contractTx['timestamp']).to.be.equal(timestamp);
    });
    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['initData']);
    it('unit test for parseFunctionData', function() {
        expect(token_id).to.be.equal(parse_function_data[0]['data']);
    });
    it('get json for sending tx', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['contract']).to.be.a('string');
        expect(send_tx['initData']).to.not.be.empty;
        expect(send_tx['signature']).to.not.be.empty;
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['description']).to.be.equal(contract_description);
    });

    it('get send register contractTx result by Chain', async() =>{
        let result = await sendRegisterContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['description']).to.be.equal(contract_description);
        expect(result['initData']).to.be.equal(send_tx['initData']);
    });

    it('get send register contractTx result by Account', async() =>{
        let result = await sendRegisterContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['description']).to.be.equal(contract_description);
        expect(result['initData']).to.be.equal(send_tx['initData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractInit']).to.be.equal(send_tx['initData']);
        expect(cold_tx['contract']).to.be.a('string');
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_CONTRACT);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
    });
})

// test register non-fungible token contract
describe('test register non-fungible token contract', function () {
    this.timeout(5000);
    // Build account and transaction
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new NonFungibleTokenContractDataGenerator()

    // Necessary data for registering non-fungible token contract
    let contract = contract_1.NON_FUNGIBLE_TOKEN_CONTRACT;
    let public_key = acc.getPublicKey();
    let contract_description = 'non-fungible token contract';
    let timestamp = Date.now() * 1e6;
    let init_data = data_generator.createInitData(); // or just []

    // Result
    let contractTx = tra.buildRegisterContractTx(public_key, contract, init_data, contract_description, timestamp);
    it('get register contractTx', function () {
        expect(contractTx).to.not.be.empty;
        expect(contractTx['contract']).to.be.a('string');
        expect(contractTx['senderPublicKey']).to.be.equal(public_key);
        expect(contractTx['description']).to.be.equal(contract_description);
        expect(contractTx['timestamp']).to.be.equal(timestamp);
    });
    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['initData']);
    it('unit test for parseFunctionData', function() {
        expect(init_data).to.eql(parse_function_data);
    });
    it('get json for sending tx', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['contract']).to.be.a('string');
        expect(send_tx['initData']).to.not.be.empty;
        expect(send_tx['signature']).to.not.be.empty;
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['description']).to.be.equal(contract_description);
    });

    it('get send register contractTx result by Chain', async() =>{
        let result = await sendRegisterContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['description']).to.be.equal(contract_description);
        expect(result['initData']).to.be.equal(send_tx['initData']);
    });

    it('get send register contractTx result by Account', async() =>{
        let result = await sendRegisterContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['description']).to.be.equal(contract_description);
        expect(result['initData']).to.be.equal(send_tx['initData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractInit']).to.be.equal(send_tx['initData']);
        expect(cold_tx['contract']).to.be.a('string');
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_CONTRACT);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
    });
})

// test issue and destroy token
describe('test issue and destroy token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new TokenContractDataGenerator();

    // Necessary data for issue adn destroy token
    let public_key = acc.getPublicKey();
    let contract_id = test_contract_id;
    let amount = test_issue_destroy_amount;
    let unity = 100000000; // 1e8
    let timestamp = Date.now() * 1e6;
    let function_data = data_generator.createIssueData(amount, unity);
    let attachment = 'issue';

    // Result of issue token
    let function_index = getContractFunctionIndex(contract_type.TOKEN, 'ISSUE');
    let issue_contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get issue token Tx', function () {
        expect(issue_contract_tx).to.not.be.empty;
        expect(issue_contract_tx['contractId']).to.be.a('string');
        expect(issue_contract_tx['functionIndex']).to.be.equal(constants.ISSUE_FUNCIDX);
        expect(issue_contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(issue_contract_tx['attachment']).to.be.equal(attachment);
    });

    let issue_bytes = tra.toBytes();
    let issue_signature = acc.getSignature(issue_bytes);
    let issue_send_tx = tra.toJsonForSendingTx(issue_signature);
    let issue_parse_function_data = convert.parseFunctionData(issue_send_tx['functionData']);
    it('unit test for parseFunctionData when issue token', function() {
        expect(BigNumber(amount).multipliedBy(unity).toString()).to.be.equal(issue_parse_function_data[0]['data'].toString());
    });
    it('get json for sending tx (issue token)', function () {
        expect(issue_send_tx).to.not.be.empty;
        expect(issue_send_tx['functionData']).to.not.be.empty;
        expect(issue_send_tx['contractId']).to.be.equal(test_contract_id);
        expect(issue_send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(issue_send_tx['signature']).to.be.equal(issue_signature);
        expect(issue_send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (issue token) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(issue_send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.ISSUE_FUNCIDX);
        expect(result['functionData']).to.be.equal(issue_send_tx['functionData']);
    });

    it('get send execute contractTx result (issue token) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(issue_send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.ISSUE_FUNCIDX);
        expect(result['functionData']).to.be.equal(issue_send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (issue token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(test_contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.ISSUE_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(issue_send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);

    });



    // Result of destroy token
    function_index = getContractFunctionIndex(contract_type.TOKEN, 'DESTROY');
    function_data = data_generator.createDestroyData(amount, unity);
    let destroy_contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get destroy token Tx', function () {
        expect(destroy_contract_tx).to.not.be.empty;
        expect(destroy_contract_tx['contractId']).to.be.a('string');
        expect(destroy_contract_tx['functionIndex']).to.be.equal(constants.DESTROY_FUNCIDX);
        expect(destroy_contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(destroy_contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let destroy_signature = acc.getSignature(bytes);
    let destroy_send_tx = tra.toJsonForSendingTx(destroy_signature);
    let destroy_parse_function_data = convert.parseFunctionData(destroy_send_tx['functionData']);
    it('unit test for parseFunctionData when destroy token', function() {
        expect(BigNumber(amount).multipliedBy(unity).toString()).to.be.equal(destroy_parse_function_data[0]['data'].toString());
    });
    it('get json for sending tx (destroy token)', function () {
        expect(destroy_send_tx).to.not.be.empty;
        expect(destroy_send_tx['contractId']).to.be.a('string');
        expect(destroy_send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(destroy_send_tx['signature']).to.be.equal(destroy_signature);
        expect(destroy_send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (destroy token) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(destroy_send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.DESTROY_FUNCIDX);
        expect(result['functionData']).to.be.equal(destroy_send_tx['functionData']);
    });

    it('get send execute contractTx result (destroy token) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(destroy_send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.DESTROY_FUNCIDX);
        expect(result['functionData']).to.be.equal(destroy_send_tx['functionData']);
    });

    let destroy_cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (destroy token)', function () {
        expect(destroy_cold_tx).to.not.be.empty;
        expect(destroy_cold_tx['contractId']).to.be.equal(test_contract_id);
        expect(destroy_cold_tx['address']).to.be.equal(address);
        expect(destroy_cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(destroy_cold_tx['functionId']).to.be.equal(constants.DESTROY_FUNCIDX);
        expect(destroy_cold_tx['function']).to.be.equal(destroy_send_tx['functionData']);
        expect(destroy_cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(destroy_cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test split token
describe('test split token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new TokenContractDataGenerator();

    // Necessary data for split token
    let public_key = acc.getPublicKey();
    let contract_id = test_contract_id;
    let new_unity = test_new_unity;
    let timestamp = Date.now() * 1e6;
    let function_data = data_generator.createSplitData(new_unity);
    let attachment = 'split token';

    // Result of split token
    let function_index = getContractFunctionIndex(contract_type.SPLITTABLE_TOKEN, 'SPLIT');
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get split token Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.SPLIT_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(new_unity.toString()).to.be.equal(parse_function_data[0]['data'].toString());
    });
    it('get json for sending tx (split token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(test_contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (split token) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.SPLIT_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (split token) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.SPLIT_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (split token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(test_contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.SPLIT_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test supersede token
describe('test supersede token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new TokenContractDataGenerator();

    // Necessary data for supersede token
    let public_key = acc.getPublicKey();
    let contract_id = test_contract_id;
    let new_issuer = test_new_issuer;
    let timestamp = Date.now() * 1e6;
    let function_data = data_generator.createSupersedeData(new_issuer);
    let attachment = 'supersede token';
    let function_index = getContractFunctionIndex(contract_type.TOKEN, 'SUPERSEDE');

    // Result of supersede token
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get supersede token Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.SUPERSEDE_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(new_issuer).to.be.equal(parse_function_data[0]['data']);
    });
    it('get json for sending tx (supersede token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(test_contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (supersede token) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.SUPERSEDE_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (supersede token) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.SUPERSEDE_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (supersede token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(test_contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.SUPERSEDE_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test send token by function buildSendTokenTx()
describe('test send token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for send token
    let public_key = acc.getPublicKey();
    let token_id = test_token_id;
    let recipient = 'AUEMZKy23xvWixKySNDg448dXxwc4GEZCC3';
    let amount = 1;
    let unity = 100000000; //1e8
    let is_split_supported = true;
    let attachment = 'send token';

    // Result of send token
    let contract_tx = tra.buildSendTokenTx(public_key, token_id, recipient, amount, unity, is_split_supported, attachment);
    it('get send token Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.SEND_FUNCIDX_SPLIT);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(recipient).to.be.equal(parse_function_data[0]['data']);
        expect(BigNumber(amount).multipliedBy(unity).toString()).to.be.equal(parse_function_data[1]['data'].toString());
    });
    it('get json for sending tx (send token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(test_contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.a('number');
    });

    it('get send execute contractTx result (send token) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.SEND_FUNCIDX_SPLIT);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
        expect(result['attachment']).to.not.be.empty;
    });

    it('get send execute contractTx result (send token) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.SEND_FUNCIDX_SPLIT);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
        expect(result['attachment']).to.not.be.empty;
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (send token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(test_contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.SEND_FUNCIDX_SPLIT);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test send token
describe('test send token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new TokenContractDataGenerator();

    // Necessary data for send token
    let public_key = acc.getPublicKey();
    let contract_id = test_contract_id;
    let recipient = 'AUEMZKy23xvWixKySNDg448dXxwc4GEZCC3';
    let timestamp = Date.now() * 1e6;
    let amount = 1;
    let unity = 100000000; //1e8
    let function_data = data_generator.createSendData(recipient, amount, unity);
    let attachment = 'send token';
    let function_index = getContractFunctionIndex(contract_type.SPLITTABLE_TOKEN, 'SEND'); //constants.SEND_FUNCIDX

    // Result of send token
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get send token Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.SEND_FUNCIDX_SPLIT);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(recipient).to.be.equal(parse_function_data[0]['data']);
        expect(BigNumber(amount).multipliedBy(unity).toString()).to.be.equal(parse_function_data[1]['data'].toString());
    });
    it('get json for sending tx (send token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(test_contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (send token) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.SEND_FUNCIDX_SPLIT);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
        expect(result['attachment']).to.not.be.empty;
    });

    it('get send execute contractTx result (send token) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.SEND_FUNCIDX_SPLIT);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
        expect(result['attachment']).to.not.be.empty;
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (send token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(test_contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.SEND_FUNCIDX_SPLIT);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test transfer token
describe('test transfer token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new TokenContractDataGenerator();

    // Necessary data for transfer token
    let public_key = acc.getPublicKey();
    let contract_id = test_contract_id;
    let sender = address;
    let recipient = 'AUEMZKy23xvWixKySNDg448dXxwc4GEZCC3';
    let timestamp = Date.now() * 1e6;
    let amount = 1;
    let unity = 100000000; //1e8
    let function_data = data_generator.createTransferData(sender, recipient, amount, unity);
    let attachment = 'transfer token';
    let function_index = getContractFunctionIndex(contract_type.SPLITTABLE_TOKEN, 'TRANSFER'); //constants.TRANSFER_FUNCIDX

    // Result of transfer token
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get transfer token Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.TRANSFER_FUNCIDX_SPLIT);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(recipient).to.be.equal(parse_function_data[1]['data']);
        expect(BigNumber(amount).multipliedBy(unity).toString()).to.be.equal(parse_function_data[2]['data'].toString());
    });
    it('get json for sending tx (transfer token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(test_contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
        expect(send_tx['attachment']).to.not.be.empty;
    });

    it('get send execute contractTx result (transfer token) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.TRANSFER_FUNCIDX_SPLIT);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
        expect(result['attachment']).to.not.be.empty;
    });

    it('get send execute contractTx result (transfer token) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.TRANSFER_FUNCIDX_SPLIT);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
        expect(result['attachment']).to.not.be.empty;
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (transfer token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(test_contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.TRANSFER_FUNCIDX_SPLIT);
        expect(cold_tx['function']).to.to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test deposit token
describe('test deposit token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new TokenContractDataGenerator();

    // Necessary data for deposit token
    // smart_contract must be PAYMENT_CONTRACT or LOCK_CONTRACT
    let public_key = acc.getPublicKey();
    let contract_id = test_contract_id;
    let sender = address;
    let smart_contract = test_payment_contract_id;
    let amount = 1;
    let unity = 100000000; //1e8
    let function_data = data_generator.createDepositData(sender, smart_contract, amount, unity);
    let attachment = 'deposit token';
    let timestamp = Date.now() * 1e6;
    let function_index = getContractFunctionIndex(contract_type.SPLITTABLE_TOKEN, 'DEPOSIT'); //constants.DEPOSIT_FUNCIDX

    // Result of deposit token
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get deposit token Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.DEPOSIT_FUNCIDX_SPLIT);
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
    it('get json for sending tx (deposit token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(test_contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (deposit token) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.DEPOSIT_FUNCIDX_SPLIT);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (deposit token) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.DEPOSIT_FUNCIDX_SPLIT);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (deposit token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(test_contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.DEPOSIT_FUNCIDX_SPLIT);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test withdraw token
describe('test withdraw token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();
    let data_generator = new TokenContractDataGenerator();

    // Necessary data for withdraw token
    let public_key = acc.getPublicKey();
    let contract_id = test_contract_id;
    let recipient = address;
    let smart_contract = test_payment_contract_id;
    let amount = 1;
    let unity = 100000000; //1e8
    let function_data = data_generator.createWithdrawData(smart_contract, recipient, amount, unity);
    let attachment = 'withdraw token';
    let timestamp = Date.now() * 1e6;
    let function_index = getContractFunctionIndex(contract_type.SPLITTABLE_TOKEN, 'WITHDRAW'); //constants.WITHDRAW_FUNCIDX

    // Result of withdraw token
    // smart_contract must be PAYMENT_CONTRACT or LOCK_CONTRACT
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get withdraw token Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.WITHDRAW_FUNCIDX_SPLIT);
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
    it('get json for sending tx (withdraw token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(test_contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (withdraw token) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.WITHDRAW_FUNCIDX_SPLIT);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (withdraw token) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.WITHDRAW_FUNCIDX_SPLIT);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (withdraw token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(test_contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.WITHDRAW_FUNCIDX_SPLIT);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});
