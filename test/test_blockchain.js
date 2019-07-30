// import "babel-polyfill";
const Blockchain = require('../libs/blockchain');
var constants = require("../libs/constants");
var expect = require("chai").expect;

const host_ip = "http://test.v.systems:9922";
const network_byte = constants.TESTNET_BYTE;

/*======= Change the below before run ==========*/

const address = "AUAztxsft2v6rmjRRb72nLea6BNyRHHWpUR";

//num: Specified number of records to be returned
const num = 10;

const tx_id = "DfHnAowHFRNhYUGR3SbeATuBxYQCXCXihBDkcp6UPWeX";

const height = 56;

//slot_id:form 0 to 59
const slot_id = 10;

const token_id = "TWtLLjtURLq5ybDHgNnFoQKvaBmUqbxMQgewzs8Ru";

const contract_id = "CEzgXYsSJ8YerN31DqC42q4in44KgijgJFo";

const transaction_id = '3pWxPKy3QkChWHd6qnkTbVH6NCEr3ezisE8WrYMfNW2i';
/*================ Change end ==================*/
async function testBalance(chain, address) {
    let result = await chain.getBalance(address);
    return result;
}

async function testBalanceDetail(chain, address) {
    const result = await chain.getBalanceDetail(address);
    return result;
}

//num: Specified number of records to be returned
async function testTxHistory(chain, address, num) {
    const result = await chain.getTxHistory(address, num);
    return result;
}

async function testTxById(chain, tx_id) {
    const result = await chain.getTxById(tx_id);
    return result;
}

async function testUnconfirmedTxById(chain, tx_id) {
    const result = await chain.getUnconfirmedTxById(tx_id);
    return result;
}

async function testHeight(chain) {
    const result = await chain.getHeight();
    return result;
}

async function testLastBlock(chain) {
    const result = await chain.getLastBlock();
    return result;
}

async function testBlockByHeight(chain, height) {
    const result = await chain.getBlockByHeight(height);
    return result;
}

async function testSlotInfo(chain, slot_id) {
    const result = await chain.getSlotInfo(slot_id);
    return result;
}

async function testAllSlotsInfo(chain) {
    const result = await chain.getAllSlotsInfo();
    return result;
}

async function testTokenInfo(chain, token_id) {
    const result = await chain.getTokenInfo(token_id);
    return result;
}

async function testTokenBalance(chain, address, token_id) {
    const result = await chain.getTokenBalance(address, token_id);
    return result;
}

async function testContractInfo(chain, contract_id) {
    const result = await chain.getContractInfo(contract_id);
    return result;
}

async function testContractContent(chain, contract_id) {
    const result = await chain.getContractContent(contract_id);
    return result;
}
//Test Blockchain
const chain = new Blockchain(host_ip, network_byte);

//test balance
describe('test get balance by address', function () {
    it('get the balance', async () =>{
        let result = await testBalance(chain, address);
        expect(result['address']).to.be.equal(address);
    })
});


//test balanceDetail
describe('testBalanceDetail', function () {
    it('get address:', async () =>{
        let result = await testBalanceDetail(chain, address);
        expect(result['address']).to.be.equal(address);
    });
    it('get available:', async () =>{
        let result = await testBalanceDetail(chain, address);
        expect(result['available']).to.be.a('string');
    });
});

//test TxHistory
describe('testTxHistory', function () {
    it('get the TxHistory', async () =>{
        let result = await testTxHistory(chain, address, num);
        expect(result).to.not.be.empty;
    })
});

//test TxById
describe('testTxById', function () {
    it('get the TxById', async () =>{
        let result = await testTxById(chain, tx_id);
        expect(result).to.not.be.empty;
    });
    it('status is success', async () =>{
        let result = await testTxById(chain, tx_id);
        expect(result['status']).to.be.equal('Success');
    });
});

//test unconfirmedTxById
describe('testUnconfirmedTxById', function () {
    it('get the unconfirmedTxById', async () =>{
        let result = await testUnconfirmedTxById(chain, address);
        expect(result).to.not.be.empty;
    });
    it('status is error', async () =>{
        let result = await testUnconfirmedTxById(chain, address);
        expect(result['status']).to.be.equal('error');
    });
});

//test Height
describe('testHeight', function () {
    it('get the height', async () =>{
        let result = await testHeight(chain);
        expect(result['height']).to.be.a('number');
    });
});

//test LastBlock
describe('testLastBlock', function () {
    it('get the lastBlock', async () =>{
        let result = await testLastBlock(chain);
        expect(result).to.not.be.empty;
    });
});

//test BlockByHeight
describe('testBlockByHeight', function () {
    it('get the BlockByHeight', async () =>{
        let result = await testBlockByHeight(chain, height);
        expect(result).to.not.be.empty;
    });
    it('correct height', async () =>{
        let result = await testBlockByHeight(chain, height);
        expect(result['height']).to.be.equal(height);
    });
});


//test SlotInfo
describe('testSlotInfo', function () {
    it('get the SlotInfo', async () =>{
        let result = await testSlotInfo(chain, slot_id);
        expect(result).to.not.be.empty;
    });
});

//test AllSlotsInfo
describe('testAllSlotsInfo', function () {
    it('get the AllSlotsInfo', async () =>{
        let result = await testAllSlotsInfo(chain);
        expect(result).to.not.be.empty;
    });
});


//test TokenInfo
describe('testTokenInfo', function () {
    it('get the TokenInfo', async () =>{
        let result = await testTokenInfo(chain, token_id);
        expect(result).to.not.be.empty;
    });
    it('get the tokenId', async () =>{
        let result = await testTokenInfo(chain, token_id);
        expect(result['tokenId']).to.be.equal(token_id);
    });
});

//test TokenBalance
describe('testTokenBalance', function () {
    it('get the TokenBalance', async () =>{
        let result = await testTokenBalance(chain, address, token_id);
        expect(result).to.not.be.empty;
    });
    it('get the address', async () =>{
        let result = await testTokenBalance(chain, address, token_id);
        expect(result['address']).to.be.equal(address);
    });
    it('get the tokenId', async () =>{
        let result = await testTokenBalance(chain, address, token_id);
        expect(result['tokenId']).to.be.equal(token_id);
    });
});

//test ContractInfo
describe('testContractInfo', function () {
    it('get the ContractInfo', async () =>{
        let result = await testContractInfo(chain, contract_id);
        expect(result).to.not.be.empty;
    });
    it('get the contractId', async () =>{
        let result = await testContractInfo(chain, contract_id);
        expect(result['contractId']).to.be.equal(contract_id);
    });
});

//test ContractContent
describe('testContractContent', function () {
    it('get the ContractContent', async () =>{
        let result = await testContractContent(chain, contract_id);
        expect(result).to.not.be.empty;
    });
    it('get the transactionId', async () =>{
        let result = await testContractContent(chain, contract_id);
        expect(result['transactionId']).to.be.equal(transaction_id);
    });
});




