// import "babel-polyfill";
const Account = require('../libs/account');
const constants = require("../libs/constants");
const expect = require("chai").expect;
const network_byte = constants.TESTNET_BYTE;

/*======= Change the below before run ==========*/
const seed = "alter glare wealth alert about inmate wild foster nothing track brown chief primary acquire energy";
const test_public_key= "DWKUGdT1HL4a3zrhoeRJd2zfKRPxmknRotdGVFrViK7o";
const test_private_key = "6vca4fTLAsMuc3r2VMNkrMiMV387jdBLwGqVxxzZae1n";
const test_address = "AUAztxsft2v6rmjRRb72nLea6BNyRHHWpUR";
const nonce = 0;
/*================ Change end ==================*/

// Test Account
//test account build with seed
describe('test account built with seed', function () {
    let account =  new Account(network_byte);
    account.buildFromSeed(seed, nonce);
    it('get publicKey', function () {
        let public_key = account.getPublicKey();
        expect(public_key).to.be.equal(test_public_key);
    });
    it('get address', function () {
        let address = account.getAddress();
        expect(address).to.be.equal(test_address);
    });
    it('get privateKey', function () {
        let private_key = account.getPrivateKey();
        expect(private_key).to.be.equal(test_private_key);
    })
});

//test account build with privateKey
describe('test account built with seed', function () {
    let account =  new Account(network_byte);
    account.buildFromPrivateKey(test_private_key);
    it('get publicKey', function () {
        let public_key = account.getPublicKey();
        expect(public_key).to.be.equal(test_public_key);
    });
    it('get address', function () {
        let address = account.getAddress();
        expect(address).to.be.equal(test_address);
    });
    it('get privateKey', function () {
        let private_key = account.getPrivateKey();
        expect(private_key).to.be.equal(test_private_key);
    })
});

//test account build with cold wallet
describe('test account built with coldWallet', function () {
    let account_with_publicKey =  new Account(network_byte);
    account_with_publicKey.buildColdWallet(test_public_key, '');
    it('get address with publicKey', function () {
        let address = account_with_publicKey.getAddress();
        expect(address).to.be.equal(test_address);
    });

    let account_with_address =  new Account(network_byte);
    account_with_address.buildColdWallet('', test_address);
    it('get address from address', function () {
        let address = account_with_address.getAddress();
        expect(address).to.be.equal(test_address);
    });
});

//test CheckAddress
describe('test check address', function () {
    let account =  new Account(network_byte);
    it('right address', function () {
        let is_valid_address = account.checkAddress(test_address);
        expect(is_valid_address).to.be.ok;
    });
});

//test ConvertPublicKeyToAddres
describe('test convert publicKey to address', function () {
    let account =  new Account(network_byte);
    it('right address', function () {
        let convert_address = account.convertPublicKeyToAddress(test_public_key, network_byte);
        expect(convert_address).to.be.equal(test_address);
    });
});
