const Transaction = require('../libs/transaction').default;
const Account = require('../libs/account').default;
const Blockchain = require('../libs/blockchain').default;
const { LockContractDataGenerator } = require('../libs/data');
const constants = require("../libs/constants");
const test_config = require('../libs/test_config');
const convert = require('../libs/utils/convert').default;
const expect = require("chai").expect;
const network_byte = constants.TESTNET_BYTE;
const host_ip = 'http://test.v.systems:9922';


