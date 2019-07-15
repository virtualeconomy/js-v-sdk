import "babel-polyfill";
const Blockchain = require('../libs/blockchain');
var constants = require("../libs/constants");

const host_ip = "http://test.v.systems:9922";
const network_byte = constants.TESTNET_BYTE;

/*======= Change the below before run ==========*/

const address = "AUAztxsft2v6rmjRRb72nLea6BNyRHHWpUR";

//num: Specified number of records to be returned
const num = 10;

const tx_id = "DfHnAowHFRNhYUGR3SbeATuBxYQCXCXihBDkcp6UPWeX";

const height = 56;

//slot_id:form 0 to 59
const slot_id = 30;

const token_id = "TWtLLjtURLq5ybDHgNnFoQKvaBmUqbxMQgewzs8Ru";

const contract_id = "CEzgXYsSJ8YerN31DqC42q4in44KgijgJFo";

/*================ Change end ==================*/


async function testBalance(chain, address) {
    const result = await chain.getBalance(address);
    console.log("getBalance:");
    console.log(result);
}

async function testBalanceDetail(chain, address) {
    const result = await chain.getBalanceDetail(address);
    console.log("getBalanceDetail:");
    console.log(result);
}

//num: Specified number of records to be returned
async function testTxHistory(chain, address, num) {
    const result = await chain.getTxHistory(address, num);
    console.log("getTxHistory:");
    console.log(result);
}

async function testTxById(chain, tx_id) {
    const result = await chain.getTxById(tx_id);
    console.log("getTxById:");
    console.log(result);
}

async function testUnconfirmedTxById(chain, tx_id) {
    const result = await chain.getUnconfirmedTxById(tx_id);
    console.log("getUnconfirmedTxById:");
    console.log(result);
}

async function testHeight(chain) {
    const result = await chain.getHeight();
    console.log("getHeight:");
    console.log(result);
}

async function testLastBlock(chain) {
    const result = await chain.getLastBlock();
    console.log("getLastBlock:");
    console.log(result);
}

async function testBlockByHeight(chain, height) {
    const result = await chain.getBlockByHeight(height);
    console.log("getBlockByHeight:");
    console.log(result);
}

async function testSlotInfo(chain, slot_id) {
    const result = await chain.getSlotInfo(slot_id);
    console.log("getSlotInfo:");
    console.log(result);
}

async function testAllSlotsInfo(chain) {
    const result = await chain.getAllSlotsInfo();
    console.log("getAllSlotsInfo:");
    console.log(result);
}

async function testTokenInfo(chain, token_id) {
    const result = await chain.getTokenInfo(token_id);
    console.log("getTokenInfo:");
    console.log(result);
}

async function testTokenBalance(chain, address, token_id) {
    const result = await chain.getTokenBalance(address, token_id);
    console.log("getTokenBalance:");
    console.log(result);
}

async function testContractInfo(chain, contract_id) {
    const result = await chain.getContractInfo(contract_id);
    console.log("getContractInfo:");
    console.log(result);
}

async function testContractContent(chain, contract_id) {
    const result = await chain.getContractContent(contract_id);
    console.log("getContractContent:");
    console.log(result);
}


// Test Blockchain
const chain = new Blockchain(host_ip, network_byte);

testBalance(chain, address);

testBalanceDetail(chain, address)

testTxHistory(chain, address, num);

testTxById(chain, tx_id);

testUnconfirmedTxById(chain, tx_id);

testHeight(chain);

testLastBlock(chain);

testBlockByHeight(chain, height);

testSlotInfo(chain, slot_id);

testAllSlotsInfo(chain);

testTokenInfo(chain, token_id);

testTokenBalance(chain, address, token_id);

testContractInfo(chain, contract_id);

testContractContent(chain, contract_id);




