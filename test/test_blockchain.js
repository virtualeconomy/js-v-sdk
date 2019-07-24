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
const slot_id = 30;

const token_id = "TWtLLjtURLq5ybDHgNnFoQKvaBmUqbxMQgewzs8Ru";

const contract_id = "CEzgXYsSJ8YerN31DqC42q4in44KgijgJFo";

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

// Test Blockchain
const chain = new Blockchain(host_ip, network_byte);

//test Balance
const test_balance_result =
    { address: 'AUAztxsft2v6rmjRRb72nLea6BNyRHHWpUR',
    confirmations: 0,
    balance: 58633509999997 };

describe('testBalance', function () {
    it('get the balance', async () =>{
        let result = await testBalance(chain, address);
        expect(result).to.deep.equal(test_balance_result);
    })
});


//test balanceDetail
const test_balance_detail_result = {
    address: 'AUAztxsft2v6rmjRRb72nLea6BNyRHHWpUR',
    regular: 58633509999997,
    mintingAverage: 58194272087287,
    available: 58406609999997,
    effective: 58407409999997,
    height: 5920795 };

describe('testBalanceDetail', function () {
    it('get address:', async () =>{
        let result = await testBalanceDetail(chain, address);
        expect(result['address']).to.deep.equal(test_balance_detail_result['address']);
        expect(result['address']).to.be.a('string');
    });
    it('get regular:', async () =>{
        let result = await testBalanceDetail(chain, address);
        expect(result['regular']).to.deep.equal(test_balance_detail_result['regular']);
        expect(result['regular']).to.be.a('number');
    });
    it('get mintingAverage:', async () =>{
        let result = await testBalanceDetail(chain, address);
        expect(result['mintingAverage']).to.be.a('number');
    });
    it('get available:', async () =>{
        let result = await testBalanceDetail(chain, address);
        expect(result['available']).to.deep.equal(test_balance_detail_result['available']);
        expect(result['available']).to.be.a('number');
    });
    it('get effective:', async () =>{
        let result = await testBalanceDetail(chain, address);
        expect(result['effective']).to.deep.equal(test_balance_detail_result['effective']);
        expect(result['effective']).to.be.a('number');
    });
    it('get height:', async () =>{
        let result = await testBalanceDetail(chain, address);
        expect(result['height']).to.be.a('number');
    });
});

//test TxHistory
describe('testTxHistory', function () {
    it('get the TxHistory', async () =>{
        let result = await testTxHistory(chain, address);
        expect(result).to.not.be.empty;
    })
});


//test TxById
const test_txById_result = {
    type: 2,
    id: 'DfHnAowHFRNhYUGR3SbeATuBxYQCXCXihBDkcp6UPWeX',
    fee: 10000000,
    timestamp: 1562923197699000000,
    proofs:
    [ { proofType: 'Curve25519',
        publicKey: 'DWKUGdT1HL4a3zrhoeRJd2zfKRPxmknRotdGVFrViK7o',
        signature: 'X4j5rMWaWtwvBTqqr9JksaEkF39iXzmRd8m3iu2sz91Zzjvf7UpusfyuQ3zbGe72epvVeCjXs7h2ASta3WwFGMr' } ],
        recipient: 'AUEMZKy23xvWixKySNDg448dXxwc4GEZCC3',
    feeScale: 100,
    amount: 10000000000,
    attachment: 'r2pimgne',
    status: 'Success',
    feeCharged: 10000000,
    height: 5581261 };

describe('testTxById', function () {
    it('get the TxById', async () =>{
        let result = await testTxById(chain, tx_id);
        expect(result).to.not.be.empty;
    });
    it('status is success', async () =>{
        let result = await testTxById(chain, tx_id);
        expect(result['status']).to.be.equal(test_txById_result['status']);
    });
});

//test unconfirmedTxById
const test_unconfirmedTxById_result = {
    status: 'error', details: 'Transaction is not in UTX' };

describe('testUnconfirmedTxById', function () {
    it('get the unconfirmedTxById', async () =>{
        let result = await testUnconfirmedTxById(chain, address);
        expect(result).to.not.be.empty;
    });
    it('status is error', async () =>{
        let result = await testUnconfirmedTxById(chain, address);
        expect(result['status']).to.be.equal(test_unconfirmedTxById_result['status']);
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
const test_blockByHeight = {
    version: 1,
    timestamp: 1544760641000697300,
    reference: '2U3ejvTHjQ6tkgfdzxmd4vnhnhCGcqhuaJEPg7EWy3cRoMKLyxhfgGHUMWgfk5Q2v3T4oFp755PqmziDpNQ7J8nw',
    SPOSConsensus: { mintTime: 1544760641000000000, mintBalance: 26906969405 },
    resourcePricingData:
        { computation: 0,
            storage: 0,
            memory: 0,
            randomIO: 0,
            sequentialIO: 0 },
    TransactionMerkleRoot: '9JwRwyzXZX6ympZty45jb3MH4W5c9DaSUqNPrQA8YVqm',
    transactions:
        [ { type: 5,
            id: '7Cb3np9QS3PWhxa35qjC6fWrynacvC3BxsVSqx46VMp2',
            recipient: 'AU31Me4Lvi1Th5uK9z4JXe3fq1BfkcNTpis',
            timestamp: 1544760641000697300,
            amount: 900000000,
            currentBlockHeight: 56,
            status: 'Success',
            feeCharged: 0 } ],
    generator: 'AU31Me4Lvi1Th5uK9z4JXe3fq1BfkcNTpis',
    signature: '2JsK7eezuiKpmVZMm8RLZjNZ4UUEWiFPUYCPnYCxXRcGZTGp5hUiBTMEqMMYzhvSa3G693mrJTEoNEhdP8bK8M3H',
    fee: 0,
    blocksize: 330,
    height: 56,
    'transaction count': 1 };
describe('testBlockByHeight', function () {
    it('get the BlockByHeight', async () =>{
        let result = await testBlockByHeight(chain, height);
        expect(result).to.not.be.empty;
    });
    it('get the signature', async () =>{
        let result = await testBlockByHeight(chain, height);
        expect(result['signature']).to.be.equal(test_blockByHeight['signature']);
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
const test_tokenInfo_result = {
    tokenId: 'TWtLLjtURLq5ybDHgNnFoQKvaBmUqbxMQgewzs8Ru',
    contractId: 'CEzgXYsSJ8YerN31DqC42q4in44KgijgJFo',
    max: 1000000000000000,
    total: 1000000000000,
    unity: 100000000,
    description: '13gQZ2GTk' };

describe('testTokenInfo', function () {
    it('get the TokenInfo', async () =>{
        let result = await testTokenInfo(chain, token_id);
        expect(result).to.not.be.empty;
    });
    it('get the contractId', async () =>{
        let result = await testTokenInfo(chain, token_id);
        expect(result['contractId']).to.be.equal(test_tokenInfo_result['contractId']);
    });
});

//test TokenBalance
const test_tokenBalance= {
    address: 'AUAztxsft2v6rmjRRb72nLea6BNyRHHWpUR',
    tokenId: 'TWtLLjtURLq5ybDHgNnFoQKvaBmUqbxMQgewzs8Ru',
    balance: 1000000000000,
    unity: 100000000 };
describe('testTokenBalance', function () {
    it('get the TokenBalance', async () =>{
        let result = await testTokenBalance(chain, address, token_id);
        expect(result).to.not.be.empty;
    });
    it('get the balance', async () =>{
        let result = await testTokenBalance(chain, address, token_id);
        expect(result['balance']).to.be.equal(test_tokenBalance['balance']);
    });
});

//test ContractInfo
const test_contractInfo = {
    contractId: 'CEzgXYsSJ8YerN31DqC42q4in44KgijgJFo',
    transactionId: '3pWxPKy3QkChWHd6qnkTbVH6NCEr3ezisE8WrYMfNW2i',
    type: 'TokenContractWithSplit',
    info:
        [ { data: 'AUAztxsft2v6rmjRRb72nLea6BNyRHHWpUR',
            type: 'Address',
            name: 'issuer' },
            { data: 'AUAztxsft2v6rmjRRb72nLea6BNyRHHWpUR',
                type: 'Address',
                name: 'maker' } ],
    height: 5581169 };
describe('testContractInfo', function () {
    it('get the ContractInfo', async () =>{
        let result = await testContractInfo(chain, contract_id);
        expect(result).to.not.be.empty;
    });
    it('get the transactionId', async () =>{
        let result = await testContractInfo(chain, contract_id);
        expect(result['transactionId']).to.be.equal(test_contractInfo['transactionId']);
    });
});

//test ContractContent
const test_contractContent_result = {
    transactionId: '3pWxPKy3QkChWHd6qnkTbVH6NCEr3ezisE8WrYMfNW2i',
    languageCode: 'vdds',
    languageVersion: 1,
    triggers: [ '111111CktRzdj615GhYiN5qtRjzxwE8jypDwGbQV9iXn8NK3o' ],
    descriptors:
        [ '1111112EP7Gb96dj5VLAcfpEDiaTeapNEfczB',
            '1bbn7XmN81WxPGPpdCtU38xMGvgaUbnrASoSQf',
            '12CCZE4Xi2itkMk8zE87pKF1mN8U311U2Bq99jV',
            '1QWywjfJS2CDokeThm2PVEKPzag9nouQ72jYj',
            '1N9hmWGg5UN8zHMrtrxMWFND6pUMLhAGg',
            '131h1vYVUznedmBCAvcPqzW6Ewx5xvXF4fB',
            '13R2cuenmhy573wnHtSch5h2jSJQ3hS6h1B',
            '13pNDtm64QxxY3tNu8tVZiwUAPB8TP9cVs7',
            '1VXrvftSE5dDWxAQwUHSpM3jdx2FR',
            '1Z6ifdCDh5xNbucPnydpgg2nbfS3R',
            '1Cyp7C43k4foxpiwcrr33L3mCEKxLsoe',
            '13zAHzf98UyzPAVrFiE8sQLcUX6EcSK' ],
    stateVariables: [ '13', '5T' ],
    textual:
        { triggers: '124VnyFU9tQUn4Z19KBbV8aAQF4aCgWrQWrLL1yK5RpWY2sU74P8GU6wJ6dwyuFHP3Xt5Kmpm',
            descriptors: '1RypGiL5eNbDESxn2SVM8HrLF6udvXV6YmwvFsp4fLJfRcr7nQuVFMvXn6KmWJeq8c53tdrutZcsQA2zyHb8Wj1tQUjGmitP6kLzcnpQXEq7AUZpMT6j7LCrhJvs3oLCCr7SSpz3h4iJJJg9WuL7Acbsw1x2AK4tRSZWXyrnLgqWhgqbTdfmxFGHjD58XrScBibJ9AUwEWCAeAna3NFofSZaSDxFJAK2adrrHhJdktQCQobMJMmC164HtJKF569naoMREkncYedQwXWk4uyPzGTUKsfXFwLaR77wv8gtNEjqwvGtpdFJELyJ3RC2F7exhqiiVxTaoGrAanuv1bianVbKqPAygPaGrhA1H3JmQWksNhg6q7dtPvBuqWDqDs4DkhV35JhNFeiER18o49pxX8zR1n1jvis6QrU2cD1Cn3yXwSZaW8TXWMKZ7ULRo1UcJykQvQCLq3EBVfzf6iULhuRagTnJ3Sq4tFSxgnNPhATLDreQpEe1BA3SfRWKRskLFjXV5aMeYxgFLfqYEFJ37BaRVyFZDSUgrKLMnNzrZZG2P81t7MhT6GpDApLZkNtjdGRMQGFsRN2azGruQReFnXeB3mScaxgfhGxcu9B',
            stateVariables: '1FKqt4aNuTwK15xVSfjkwT' },
    height: 5581169 };

describe('testContractContent', function () {
    it('get the ContractContent', async () =>{
        let result = await testContractContent(chain, contract_id);
        expect(result).to.not.be.empty;
    });
    it('get the transactionId', async () =>{
        let result = await testContractContent(chain, contract_id);
        expect(result['transactionId']).to.be.equal(test_contractContent_result['transactionId']);
    });
});




