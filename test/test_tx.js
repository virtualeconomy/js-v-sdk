import "babel-polyfill";
const Transaction = require('../libs/transaction');
const Account = require('../libs/account');
var constants = require("../libs/constants");

const network_byte = constants.TESTNET_BYTE;
const host_ip = 'http://test.v.systems:9922';

/*======= Change the below before run ==========*/
const seed = "alter glare wealth alert about inmate wild foster nothing track brown chief primary acquire energy";
const recipient = "AUEMZKy23xvWixKySNDg448dXxwc4GEZCC3";
const attachment = "hello world";
const nonce = 0;
const amount = 1000;
const test_lease_id = "HYSi8CXcwXkvTEwa5eSY7ksjyHnMyaMMcGqdPyYSTY5a"; // only use once
/*================ Change end ==================*/



//paymentTx test, (send amount VSYS)
function testPaymentTx(amount) {
    console.log("test PaymentTx begin:");

    let acc =  new Account(network_byte);
    acc.buildFromSeed(seed, nonce);
    let public_key = acc.getPublicKey();
    let tra = new Transaction(network_byte);

    let timestamp = Date.now() * 1e6;
    tra.buildPaymentTx(public_key, recipient, amount, attachment, timestamp);

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let sendTx = tra.toJsonForSendingTx(signature);
    sendPaymentTx(acc, sendTx);

    let coldSig = tra.toJsonForColdSignature();
    console.log("json for cold signature:");
    console.log(coldSig);

    console.log("test PaymentTx end:")
}




//LeasingTx test, (lease amount VSYS)
function testLeasingTx(amount) {
    console.log("test LeasingTx begin:");

    let acc =  new Account(network_byte);
    acc.buildFromSeed(seed, nonce);
    let public_key = acc.getPublicKey();
    let tra = new Transaction(network_byte);

    let timestamp = Date.now() * 1e6;
    tra.buildLeasingTx(public_key, recipient, amount, timestamp);

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let sendTx = tra.toJsonForSendingTx(signature);
    sendLeasingTx(acc, sendTx);

    let coldSig = tra.toJsonForColdSignature();
    console.log("json for cold signature:");
    console.log(coldSig);

    console.log("test LeasingTx end:");
}


//CancelLeasingTx test
function testCancelLeasingTx() {
    console.log("test CancelLeasingTx begin:");

    let acc =  new Account(network_byte);
    acc.buildFromSeed(seed, nonce);
    let public_key = acc.getPublicKey();
    let tra = new Transaction(network_byte);

    let lease_id = test_lease_id;
    let timestamp = Date.now() * 1e6;
    tra.buildCancelLeasingTx(public_key, lease_id, timestamp);

    let bytes = tra.toBytes();
    let signature = acc.getSignature(bytes);
    let sendTx = tra.toJsonForSendingTx(signature);
    sendCancelLeasingTx(acc, sendTx);
    let coldSig = tra.toJsonForColdSignature();
    console.log("json for cold signature:");
    console.log(coldSig);
    console.log("test CancelLeasingTx end:");
}

async function sendPaymentTx(acc, tx) {
    let node = host_ip + '/vsys/broadcast/payment';
    const result = await acc.sendTransactionTx(node, tx);
    console.log("result:");
    console.log(result);
}

async function sendLeasingTx(acc, tx) {
    let node = host_ip + '/leasing/broadcast/lease';
    const result = await acc.sendTransactionTx(node, tx);
    console.log(result);
}

async function sendCancelLeasingTx(acc, tx) {
    let node = host_ip + '/leasing/broadcast/cancel';
    const result = await acc.sendTransactionTx(node, tx);
    console.log(result);
}

testPaymentTx(amount);
testLeasingTx(amount);
testCancelLeasingTx();
