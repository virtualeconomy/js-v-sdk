// import "babel-polyfill";
const Transaction = require('../libs/transaction');
const Account = require('../libs/account');
const Blockchain = require('../libs/blockchain');
const constants = require("../libs/constants");
const test_config = require('../libs/test_config');
const expect = require("chai").expect;
const network_byte = constants.TESTNET_BYTE;
const host_ip = 'http://test.v.systems:9922';
var test_lease_id = '';
var cancel_lease_result = '';

/*======= Change the below before run ==========*/
const recipient = "AUEMZKy23xvWixKySNDg448dXxwc4GEZCC3";
const sender_public_key = "DWKUGdT1HL4a3zrhoeRJd2zfKRPxmknRotdGVFrViK7o";
const attachment = "hello world";
const amount = 1;
/*================ Change end ==================*/



async function sendPaymentTxByAccount(tx) {
    let acc = new Account(network_byte);
    const result = await acc.sendTransaction(chain, tx);
    return result;
}

async function sendPaymentTxByChain(tx) {
    const result = await chain.sendPaymentTx(tx);
    return result;
}

async function sendLeasingTxByAccount(tx) {
    let acc = new Account(network_byte);
    const result = await acc.sendTransaction(chain, tx);
    return result;
}

async function sendLeasingTxByChain(tx) {
    const result = await chain.sendLeasingTx(tx);
    return result;
}

async function sendCancelLeasingTxByAccount(tx) {
    let acc = new Account(network_byte);
    cancel_lease_result = await acc.sendTransaction(chain, tx);
}

async function sendCancelLeasingTxByChain(tx) {
    const result = await chain.sendCancelLeasingTx(tx);
    return result;
}

const chain = new Blockchain(host_ip, network_byte);
//test payment tx (send 1 amount VSYS) and buildTransactionId
describe('test payment tx', function () {
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let public_key = acc.getPublicKey();
    let tra = new Transaction(network_byte);

    let result = '';
    let timestamp = Date.now() * 1e6;
    tra.buildPaymentTx(public_key, recipient, amount, attachment, timestamp);

    let bytes = tra.toBytes();
    let transaction_id = tra.buildTransactionId(bytes);
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);

    let cold_tx = tra.toJsonForColdSignature();
    it('get send tx', function () {
        expect(send_tx).to.not.be.empty;
    });
    it('get cold tx', function () {
        expect(cold_tx).to.not.be.empty;
    });
    it('get sender publicKey in cold tx', function () {
        expect(cold_tx['senderPublicKey']).to.be.equal(sender_public_key);
    });
    it('get recipient in cold tx', function () {
        expect(cold_tx['recipient']).to.be.equal(recipient);
    });
    it('get correct transactionType in cold tx', function () {
        expect(cold_tx['transactionType']).to.be.equal(constants.PAYMENT_TX);
    });
    it('get correct opc in cold tx', function () {
        expect(cold_tx['opc']).to.be.equal(constants.OPC_TRANSACTION);
    });
    it('get protocol in cold tx', function () {
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
    it('get sendPayment tx result by Account', async ()=>{
        result = await sendPaymentTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['recipient']).to.be.equal(recipient);
        expect(result['amount']).to.be.equal(send_tx['amount']);
        expect(result['attachment']).to.be.equal(send_tx['attachment']);
        expect(result['type']).to.be.equal(constants.PAYMENT_TX);
    });
    it('get sendPayment tx result by Chain', async ()=>{
        result = await sendPaymentTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['recipient']).to.be.equal(recipient);
        expect(result['amount']).to.be.equal(send_tx['amount']);
        expect(result['attachment']).to.be.equal(send_tx['attachment']);
        expect(result['type']).to.be.equal(constants.PAYMENT_TX);
    });
    it('build correct transactionId', function () {
        expect(result['id']).to.be.equal(transaction_id);
    });
});


//test leasing tx (lease 1 amount VSYS)
describe('test leasing tx', function () {
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let public_key = acc.getPublicKey();
    let tra = new Transaction(network_byte);

    let timestamp = Date.now() * 1e6;
    tra.buildLeasingTx(public_key, recipient, amount, timestamp);

    let bytes = tra.toBytes();

    test_lease_id = tra.buildTransactionId(bytes);
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);

    let cold_tx = tra.toJsonForColdSignature();

    it('get send tx', function () {
       expect(send_tx).to.not.be.empty;
    });
    it('get cold tx', function () {
        expect(cold_tx).to.not.be.empty;
    });

    it('get sender publicKey in cold tx', function () {
        expect(cold_tx['senderPublicKey']).to.be.equal(sender_public_key);
    });
    it('get recipient in cold tx', function () {
        expect(cold_tx['recipient']).to.be.equal(recipient);
    });
    it('get correct transactionType in cold tx', function () {
        expect(cold_tx['transactionType']).to.be.equal(constants.LEASE_TX);
    });
    it('get correct opc in cold tx', function () {
        expect(cold_tx['opc']).to.be.equal(constants.OPC_TRANSACTION);
    });
    it('get protocol in cold tx', function () {
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
    it('get leasing tx result by Account', async ()=>{
        let result = await sendLeasingTxByAccount(send_tx);
        expect(result).to.not.be.empty;
        expect(result['recipient']).to.be.equal(recipient);
        expect(result['amount']).to.be.equal(send_tx['amount']);
        expect(result['type']).to.be.equal(constants.LEASE_TX);
    });
    it('get leasing tx result by Chain', async ()=>{
        let result = await sendLeasingTxByChain(send_tx);
        expect(result).to.not.be.empty;
        expect(result['recipient']).to.be.equal(recipient);
        expect(result['amount']).to.be.equal(send_tx['amount']);
        expect(result['type']).to.be.equal(constants.LEASE_TX);
    });
});


//test cancel leasing tx ()
describe('test cancel leasing tx', function () {
    let acc =  new Account(network_byte);
    acc.buildFromSeed(test_config.seed, test_config.nonce);
    let public_key = acc.getPublicKey();
    let tra = new Transaction(network_byte);

    let lease_id = test_lease_id;
    let timestamp = Date.now() * 1e6;
    tra.buildCancelLeasingTx(public_key, lease_id, timestamp);

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let send_tx = tra.toJsonForSendingTx(signature);
    let cold_tx = tra.toJsonForColdSignature();
    it('get send tx', function () {
        expect(send_tx).to.not.be.empty;
    });
    it('get cold tx', function () {
        expect(cold_tx).to.not.be.empty;
    });
    it('get sender publicKey in cold tx', function () {
        expect(cold_tx['senderPublicKey']).to.be.equal(sender_public_key);
    });
    it('get txId in cold tx', function () {
        expect(cold_tx['txId']).to.be.equal(lease_id);
    });
    it('get correct transactionType in cold tx', function () {
        expect(cold_tx['transactionType']).to.be.equal(constants.CANCEL_LEASE_TX);
    });
    it('get correct opc in cold tx', function () {
        expect(cold_tx['opc']).to.be.equal(constants.OPC_TRANSACTION);
    });
    it('get protocol in cold tx', function () {
        expect(cold_tx['protocol']).to.be.equal(constants.PROTOCOL);
    });
    it('get cancel leasing tx result by Account', async ()=>{
        await sendCancelLeasingTxByAccount(send_tx);
        expect(cancel_lease_result).to.not.be.empty;
    });
    it('get cancel leasing tx result by Chain', async ()=>{
        await sendCancelLeasingTxByChain(send_tx);
        expect(cancel_lease_result).to.not.be.empty;
    });
});
