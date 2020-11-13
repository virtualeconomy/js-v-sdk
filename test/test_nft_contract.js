const Transaction = require('../libs/transaction').default;
const Account = require('../libs/account').default;
const Blockchain = require('../libs/blockchain').default;
const { NonFungibleTokenContractDataGenerator } = require('../libs/data');
const constants = require("../libs/constants");
const test_config = require('../libs/test_config');
const convert = require('../libs/utils/convert').default;
const expect = require("chai").expect;
const network_byte = constants.TESTNET_BYTE;
const host_ip = 'http://test.v.systems:9922';
/*======= Change the below before run ==========*/
const test_nft_contract_id = 'CEw29bfyUJgcRcPhuanFcxWqiWD19D99NYi';
const test_new_issuer = 'AUAztxsft2v6rmjRRb72nLea6BNyRHHWpUR';
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
const data_generator = new NonFungibleTokenContractDataGenerator();

// test supersede
describe('test supersede', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for supersede
    let public_key = acc.getPublicKey();
    let contract_id = test_nft_contract_id;
    let new_issuer = test_new_issuer;
    let timestamp = Date.now() * 1e6;
    let function_data = data_generator.createSupersedeData(new_issuer);
    let attachment = 'supersede nft';
    let function_index = constants.NFT_CONTRACT_SUPERSEDE_FUNCIDX;

    // Result of supersede
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get supersede Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.NFT_CONTRACT_SUPERSEDE_FUNCIDX);
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
    it('get json for sending tx (supersede)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(test_nft_contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (supersede) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_nft_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.NFT_CONTRACT_SUPERSEDE_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (supersede) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(test_nft_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.NFT_CONTRACT_SUPERSEDE_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (supersede)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(test_nft_contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.NFT_CONTRACT_SUPERSEDE_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});

// test send
describe('test send', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    //TODO after issue, change to acc.buildFromSeed(test_config.seed, test_config.nonce);
    acc.buildFromPrivateKey("ADBm8m987tEPtAFEgy9zyYLeugMmNykZGmzotLXxQJTj")
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for send
    let public_key = acc.getPublicKey();
    // TODO after issue, change contract_id = test_nft_contract_id
    let contract_id = "CEv8nXMzXCx15HZqsvEy6zjQxLvZJUv5P6p";
    let timestamp = Date.now() * 1e6;
    let recipient = "AU59JztgHbANCpu5PuHQt7z6BakzQN2e6tr"
    let tokenIndex = 0
    let function_data = data_generator.createSendData(recipient, tokenIndex)
    let attachment = 'send nft';
    let function_index = constants.NFT_CONTRACT_SEND_FUNCIDX;

    // Result of send
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get send Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.NFT_CONTRACT_SEND_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(recipient).to.be.equal(parse_function_data[0]['data']);
        expect(tokenIndex).to.be.equal(parse_function_data[1]['data']);
    });
    it('get json for sending tx (send)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        // TODO after issue, cancel annotation
        // expect(send_tx['contractId']).to.be.equal(test_nft_contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (send) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        // TODO after issue, cancel annotation
        // expect(result['contractId']).to.be.equal(test_nft_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.NFT_CONTRACT_SEND_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (send) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        // TODO after issue, cancel annotation
        // expect(result['contractId']).to.be.equal(test_nft_contract_id);
        expect(result['functionIndex']).to.be.equal(constants.NFT_CONTRACT_SEND_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (send)', function () {
        expect(cold_tx).to.not.be.empty;
        // TODO after issue, cancel annotation
        // expect(cold_tx['contractId']).to.be.equal(test_nft_contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.NFT_CONTRACT_SEND_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});
