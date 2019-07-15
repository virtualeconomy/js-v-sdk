import "babel-polyfill";
const Account = require('../libs/account');
var constants = require("../libs/constants");

const network_byte = constants.TESTNET_BYTE;

/*======= Change the below before run ==========*/
const seed = "alter glare wealth alert about inmate wild foster nothing track brown chief primary acquire energy";
const test_public_key= "DWKUGdT1HL4a3zrhoeRJd2zfKRPxmknRotdGVFrViK7o";
const test_private_key = "6vca4fTLAsMuc3r2VMNkrMiMV387jdBLwGqVxxzZae1n";
const test_address = "AUAztxsft2v6rmjRRb72nLea6BNyRHHWpUR";
const nonce = 0;
/*================ Change end ==================*/



function testAccountBuildWithSeed(seed, nonce) {
    let account =  new Account(network_byte);
    account.buildFromSeed(seed, nonce);
    console.log("test account built with seed:");
    testGetPublicKeyAndAddress(account);
    testGetPrivateKey(account);
    console.log('')
}

function testAccountBuildWithPrivateKey(private_key) {
    let account =  new Account(network_byte);
    account.buildFromPrivateKey(private_key);
    console.log("test account built with private key");
    testGetPublicKeyAndAddress(account);
    testGetPrivateKey(account);
    console.log('')
}

function testAccountBuildWithColdWallet(public_key, input_address) {

    // Test Build Account with public_key
    let account_with_publicKey =  new Account(network_byte);
    account_with_publicKey.buildColdWallet(public_key, '');
    console.log("test account built with cold wallet and public_key")
    let address = account_with_publicKey.getAddress();
    console.log("get address:");
    console.log(address);
    if(address == test_address) {
        console.log("Get address succeeded!");
    }
    else {
        console.log("Get address failed!");
    }
    console.log('')


    //Test Build Account with input_address
    let account_with_address =  new Account(network_byte);
    account_with_address.buildColdWallet('', input_address);
    console.log("test account built with cold wallet and address")
    address = account_with_address.getAddress();
    console.log("get address:");
    console.log(address);
    if(address == test_address) {
        console.log("Get address succeeded!");
    }
    else {
        console.log("Get address failed!");
    }
    console.log('')

}

function testGetPrivateKey(account) {
    let private_key = account.getPrivateKey();
    console.log("get private_key:");
    console.log(private_key);
    if(private_key == test_private_key) {
        console.log("Get private_key succeeded!");
    }
    else {
        console.log("Get private_key failed!");
    }
}
function testGetPublicKeyAndAddress(account) {
    let public_key = account.getPublicKey();
    console.log("get public_key:");
    console.log(public_key);
    if(public_key == test_public_key) {
        console.log("Get public_key succeeded!");
    }
    else {
        console.log("Get public_key failed!")
    }

    let address = account.getAddress();
    console.log("get address:");
    console.log(address);
    if(address == test_address) {
        console.log("Get address succeeded!");
    }
    else {
        console.log("Get address failed!");
    }
}

function testCheckAddress(address) {
    let account =  new Account(network_byte);
    let is_valid_address = account.checkAddress(address);
    console.log("test check address:");
    if(is_valid_address) {
        console.log("check address succeeded!");
    }
    else {
        console.log("check address failed!");
    }
    console.log('')
}

function testConvertPublicKeyToAddress(public_key, network_byte) {
    let account =  new Account(network_byte);
    let convert_address = account.convertPublicKeyToAddress(public_key, network_byte);
    console.log("test convert public key to address:")
    if(convert_address == test_address) {
        console.log("Succeeded!")
    }
    else {
        console.log("failed!")
    }
    console.log('')
}

// Test Account
testAccountBuildWithSeed(seed, nonce)
testAccountBuildWithPrivateKey(test_private_key);
testAccountBuildWithColdWallet(test_public_key, test_address);
testCheckAddress(test_address);
testConvertPublicKeyToAddress(test_public_key, network_byte);


