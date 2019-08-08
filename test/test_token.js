// import "babel-polyfill";
const Transaction = require('../libs/transaction');
const Account = require('../libs/account');
const Blockchain = require('../libs/blockchain');
const constants = require("../libs/constants");
const contract_1 = require("../libs/contract");
const test_config = require('../libs/test_config');
const expect = require("chai").expect;
const network_byte = constants.TESTNET_BYTE;
const host_ip = 'http://test.v.systems:9922';

/*======= Change the below before run ==========*/
const recipient = "AUEMZKy23xvWixKySNDg448dXxwc4GEZCC3";
const test_new_unity = 100000000;
const test_issue_destroy_amount = 1;
const test_new_issuer = 'AUAztxsft2v6rmjRRb72nLea6BNyRHHWpUR';
const test_token_id = 'TWusvy35hepR6SKw7RM4zc3kX4DZ1FQsWEgf5S6XA';
const test_contract_id = 'CFENccDVaB6G6HKoXpJHisPPeUwbaaQQ1ZM';
/*================ Change end ==================*/

async function sendRegisterContractTx(tx) {
    const result = await chain.sendRegisterContractTx(tx);
    return result;
}

async function sendExecuteContractTx(tx) {
    const result = await chain.sendExecuteContractTx(tx);
    return result;
}

const chain = new Blockchain(host_ip, network_byte);
//test CreateToken
describe('test create token', function () {
    this.timeout(5000);
    // Build account and transaction
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for creating token
    let contract = contract_1.TOKEN_CONTRACT;
    let public_key = acc.getPublicKey();
    let amount = 9999;
    let unity = 100000000; // 1e8
    let token_description = 'token';
    let contract_description = 'contract';
    let timestamp = Date.now() * 1e6;
    let init_data = {amount, unity, token_description};

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

    it('get json for sending tx', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['contract']).to.be.a('string');
        expect(send_tx['initData']).to.not.be.empty;
        expect(send_tx['signature']).to.not.be.empty;
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['description']).to.be.equal(contract_description);
    });

    it('get send register contractTx result', async() =>{
        let result = await sendRegisterContractTx(send_tx);
        expect(result).to.not.be.empty;
        expect(result['description']).to.be.equal(contract_description);
        expect(result['initData']).to.be.equal(send_tx['initData']);

    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contract']).to.be.a('string');
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_CONTRACT);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);

    });
});

//test issue and destroy token
describe('test issue and destroy token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for issue adn destroy token
    let public_key = acc.getPublicKey();
    let contract_id = test_contract_id;
    let amount = test_issue_destroy_amount;
    let unity = 100000000; // 1e8
    let timestamp = Date.now() * 1e6;
    let function_data = {amount, unity};
    let attachment = undefined;

    // Result of issue token
    // Only sendToken function needs attachment
    let function_index = constants.ISSUE_FUNCIDX;
    let issue_contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);

    it('get issue token Tx', function () {
        expect(issue_contract_tx).to.not.be.empty;
        expect(issue_contract_tx['contractId']).to.be.a('string');
        expect(issue_contract_tx['functionIndex']).to.be.equal(constants.ISSUE_FUNCIDX);
        expect(issue_contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(issue_contract_tx['attachment']).to.be.equal(undefined);
    });

    let issue_bytes = tra.toBytes();
    let issue_signature = acc.getSignature(issue_bytes);
    let issue_send_tx = tra.toJsonForSendingTx(issue_signature);
    it('get json for sending tx (issue token)', function () {
        expect(issue_send_tx).to.not.be.empty;
        expect(issue_send_tx['functionData']).to.not.be.empty;
        expect(issue_send_tx['contractId']).to.be.equal(test_contract_id);
        expect(issue_send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(issue_send_tx['signature']).to.be.equal(issue_signature);
        expect(issue_send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (issue token)', async() =>{
        let result = await sendExecuteContractTx(issue_send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.ISSUE_FUNCIDX);
        expect(result['functionData']).to.be.equal(issue_send_tx['functionData']);
        expect(result['attachment']).to.be.equal('');
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (issue token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(test_contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.ISSUE_FUNCIDX);
        expect(cold_tx['function']).to.not.be.empty;
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);

    });



    // Result of destroy token
    // Only sendToken function needs attachment
    function_index = constants.DESTROY_FUNCIDX;
    function_data = {amount, unity};
    let destroy_contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get destroy token Tx', function () {
        expect(destroy_contract_tx).to.not.be.empty;
        expect(destroy_contract_tx['contractId']).to.be.a('string');
        expect(destroy_contract_tx['functionIndex']).to.be.equal(constants.DESTROY_FUNCIDX);
        expect(destroy_contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(destroy_contract_tx['attachment']).to.be.equal(undefined);
    });

    let bytes = tra.toBytes();
    let destroy_signature = acc.getSignature(bytes);
    let destroy_send_tx = tra.toJsonForSendingTx(destroy_signature);
    it('get json for sending tx (destroy token)', function () {
        expect(destroy_send_tx).to.not.be.empty;
        expect(destroy_send_tx['contractId']).to.be.a('string');
        expect(destroy_send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(destroy_send_tx['signature']).to.be.equal(destroy_signature);
        expect(destroy_send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (destroy token)', async() =>{
        let result = await sendExecuteContractTx(destroy_send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.DESTROY_FUNCIDX);
        expect(result['functionData']).to.be.equal(destroy_send_tx['functionData']);
        expect(result['attachment']).to.be.equal('');
    });

    let destroy_cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (destroy token)', function () {
        expect(destroy_cold_tx).to.not.be.empty;
        expect(destroy_cold_tx['contractId']).to.be.equal(test_contract_id);
        expect(destroy_cold_tx['address']).to.be.equal(address);
        expect(destroy_cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(destroy_cold_tx['functionId']).to.be.equal(constants.DESTROY_FUNCIDX);
        expect(destroy_cold_tx['function']).to.not.be.empty;
        expect(destroy_cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(destroy_cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

//test split token
describe('test split token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for issue token
    let public_key = acc.getPublicKey();
    let contract_id = test_contract_id;
    let new_unity = test_new_unity;
    let timestamp = Date.now() * 1e6;
    let function_data = { new_unity };
    let attachment = undefined;

    // Result of split token
    // Only sendToken function needs attachment
    let function_index = constants.SPLIT_FUNCIDX;
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get split token Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.SPLIT_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(undefined);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    it('get json for sending tx (split token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(test_contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (split token)', async() =>{
        let result = await sendExecuteContractTx(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.SPLIT_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
        expect(result['attachment']).to.be.equal('');
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (split token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(test_contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.SPLIT_FUNCIDX);
        expect(cold_tx['function']).to.not.be.empty;
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

//test supersede token
describe('test supersede token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for supersede token
    let public_key = acc.getPublicKey();
    let contract_id = test_contract_id;
    let new_issuer = test_new_issuer;
    let timestamp = Date.now() * 1e6;
    let function_data = { new_issuer };
    let attachment = undefined;
    let function_index = constants.SUPERSEDE_FUNCIDX;

    // Result of supersede token
    // Only sendToken function needs attachment
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get supersede token Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.SUPERSEDE_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(undefined);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    it('get json for sending tx (supersede token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(test_contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (supersede token)', async() =>{
        let result = await sendExecuteContractTx(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.SUPERSEDE_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
        expect(result['attachment']).to.be.equal('');
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (supersede token)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(test_contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.SUPERSEDE_FUNCIDX);
        expect(cold_tx['function']).to.not.be.empty;
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

//test send token by function buildSendTokenTx()
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
    let amount = 10;
    let unity = 100000000; //1e8
    let is_split_supported = true;
    let attachment = 'send token';

    // Result of send token
    // Only sendToken function needs attachment
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
    it('get json for sending tx (send token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(test_contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.a('number');
    });

    it('get send execute contractTx result (send token)', async() =>{
        let result = await sendExecuteContractTx(send_tx);
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
        expect(cold_tx['function']).to.not.be.empty;
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

//test send token
describe('test send token', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for send token
    let public_key = acc.getPublicKey();
    let contract_id = test_contract_id;
    let recipient = 'AUEMZKy23xvWixKySNDg448dXxwc4GEZCC3';
    let timestamp = Date.now() * 1e6;
    let amount = 1;
    let unity = 100000000; //1e8
    let function_data = {recipient, amount, unity}
    let attachment = 'send token';
    let function_index = constants.SEND_FUNCIDX_SPLIT;

    // Result of send token
    // Only sendToken function needs attachment
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
    it('get json for sending tx (send token)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(test_contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (send token)', async() =>{
        let result = await sendExecuteContractTx(send_tx);
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
        expect(cold_tx['function']).to.not.be.empty;
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});
