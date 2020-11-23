const Transaction = require('../libs/transaction').default;
const Account = require('../libs/account').default;
const Blockchain = require('../libs/blockchain').default;
const { LockContractDataGenerator, getContractFunctionIndex } = require('../libs/data');
const constants = require("../libs/constants");
const contract_type = require("../libs/contract_type");
const test_config = require('../libs/test_config');
const convert = require('../libs/utils/convert').default;
const expect = require("chai").expect;
const network_byte = constants.TESTNET_BYTE;
const host_ip = 'http://test.v.systems:9922';
/*======= Change the below before run ==========*/
const test_lock_contract_id = 'CEtYyyXDHj8AnK3SBT2RPLVoMLpR8uXSCYU';
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
const data_generator = new LockContractDataGenerator();

// test lock
describe('test lock', function () {
    // Build account and transaction
    this.timeout(5000);
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let tra = new Transaction(network_byte);
    let address = acc.getAddress();

    // Necessary data for lock
    let contract_id = test_lock_contract_id
    let public_key = acc.getPublicKey();
    let lock_time = Date.now() * 1e6;
    let function_data = data_generator.createLockData(lock_time);
    let attachment = 'lock';
    let timestamp = Date.now() * 1e6;
    let function_index = getContractFunctionIndex(contract_type.LOCK, 'LOCK');

    // Result of lock
    let contract_tx = tra.buildExecuteContractTx(public_key, contract_id, function_index, function_data, timestamp, attachment);
    it('get lock Tx', function () {
        expect(contract_tx).to.not.be.empty;
        expect(contract_tx['contractId']).to.be.a('string');
        expect(contract_tx['functionIndex']).to.be.equal(constants.LOCK_CONTRACT_LOCK_FUNCIDX);
        expect(contract_tx['senderPublicKey']).to.be.equal(public_key);
        expect(contract_tx['attachment']).to.be.equal(attachment);
    });

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let parse_function_data = convert.parseFunctionData(send_tx['functionData']);
    it('unit test for parseFunctionData', function() {
        expect(lock_time).to.be.equal(parse_function_data[0]['data']);
    });
    it('get json for sending tx (lock)', function () {
        expect(send_tx).to.not.be.empty;
        expect(send_tx['functionData']).to.not.be.empty;
        expect(send_tx['contractId']).to.be.equal(contract_id);
        expect(send_tx['senderPublicKey']).to.be.equal(public_key);
        expect(send_tx['signature']).to.be.equal(signature);
        expect(send_tx['timestamp']).to.be.equal(timestamp);
    });

    it('get send execute contractTx result (lock) by Chain', async() =>{
        let result = await sendExecuteContractTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.LOCK_CONTRACT_LOCK_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    it('get send execute contractTx result (lock) by Account', async() =>{
        let result = await sendExecuteContractTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['contractId']).to.be.equal(contract_id);
        expect(result['functionIndex']).to.be.equal(constants.LOCK_CONTRACT_LOCK_FUNCIDX);
        expect(result['functionData']).to.be.equal(send_tx['functionData']);
    });

    let cold_tx = tra.toJsonForColdSignature();
    it('get json for cold signature (lock)', function () {
        expect(cold_tx).to.not.be.empty;
        expect(cold_tx['contractId']).to.be.equal(contract_id);
        expect(cold_tx['address']).to.be.equal(address);
        expect(cold_tx['opc']).to.be.equal(constants.OPC_FUNCTION);
        expect(cold_tx['functionId']).to.be.equal(constants.LOCK_CONTRACT_LOCK_FUNCIDX);
        expect(cold_tx['function']).to.be.equal(send_tx['functionData']);
        expect(cold_tx['api']).to.be.equal(constants.API_VERSION);
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
});
