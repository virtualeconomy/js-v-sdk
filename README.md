# js-vsystems
JavaScript library for V Systems

## Install from git

  1. install node.js (homebrew or https://nodejs.org/)

  2. clone this project

``` bash
$ git clone https://github.com/virtualeconomy/js-v-sdk.git
```

  3. install packages

```bash
$ cd js-v-sdk
$ npm install
```

## Install from npm

  1. install packages

```bash
$ npm i @virtualeconomy/js-v-sdk
```

## Usage

### chain object
1. For testnet chain:

    ```javascript
    const vsys = require("@virtualeconomy/js-v-sdk");
    const constants = vsys.constants;
    const node_address = "http://test.v.systems:9922"; // change to your node address
    const network_byte = constants.TESTNET_BYTE;
    var chain = new vsys.Blockchain(node_address, network_byte);
    ```

2. For mainnet chain:

    ```javascript
    const vsys = require("@virtualeconomy/js-v-sdk");
    const constants = vsys.constants;
    const node_address = "https://wallet.v.systems/api"; // change to your node address
    const network_byte = constants.TESTNET_BYTE;
    var chain = new vsys.Blockchain(node_address, network_byte);
    ```
3. Methods in chain object:
    ```javascript
    // Get Balance
    async function getBalance(chain, address) {
        let result = await chain.getBalance(address);
        console.log(result);
    }
    getBalance(chain, "<address>");

    // Get Balance Detail
    async function getBalanceDetail(chain, address) {
        const result = await chain.getBalanceDetail(address);
        console.log(result);
    }
    getBalanceDetail(chain, "<address>");

    // Get transaction history
    // num: Specified number of records to be returned
    async function getTxHistory(chain, address, num) {
        const result = await chain.getTxHistory(address, num);
        console.log(result);
    }
    getTxHistory(chain, "<address>", "<num>");

    // Get transaction by id
    // tx_id: transaction id
    async function getTxById(chain, tx_id) {
        const result = await chain.getTxById(tx_id);
        console.log(result);
    }
    getTxById(chain, "<tx_id>");

    // Get unconfirmed transaction by id
    // tx_id: transaction id
    async function getUnconfirmedTxById(chain, tx_id) {
        const result = await chain.getUnconfirmedTxById(tx_id);
        console.log(result);
    }
    getUnconfirmedTxById(chain, "<tx_id>");

    // Get block height
    async function getHeight(chain) {
        const result = await chain.getHeight();
        console.log(result);
    }
    getHeight(chain);

    // Get last block
    async function getLastBlock(chain) {
        const result = await chain.getLastBlock();
        console.log(result);
    }
    getHeight(chain);

    // Get block by height
    async function getBlockByHeight(chain, height) {
        const result = await chain.getBlockByHeight(height);
        console.log(result);
    }
    getBlockByHeight(chain, "<height>");

    // Get slot information
    async function getSlotInfo(chain, slot_id) {
        const result = await chain.getSlotInfo(slot_id);
        console.log(result);
    }
    getSlotInfo(chain, "<slot_id>");

    // Get all slots information
    async function getAllSlotsInfo(chain) {
        const result = await chain.getAllSlotsInfo();
        console.log(result);
    }
    getAllSlotsInfo(chain);

    // Get token information
    async function getTokenInfo(chain, token_id) {
        const result = await chain.getTokenInfo(token_id);
        console.log(result);
    }
    getTokenInfo(chain, "<token_id>");

    // Get address's token balance
    async function getTokenBalance(chain, address, token_id) {
        const result = await chain.getTokenBalance(address, token_id);
        console.log(result);
    }
    getTokenBalance(chain, "<address>", "<token_id>");

    // Get contract information
    async function getContractInfo(chain, contract_id) {
        const result = await chain.getContractInfo(contract_id);
        console.log(result);
    }
    getContractInfo(chain, "<contract_id>");

    // Get contract content
    async function getContractContent(chain, contract_id) {
        const result = await chain.getContractContent(contract_id);
        console.log(result);
    }
    getContractContent(chain, "<contract_id>");

    // Send payment tx to node
    async function sendPaymentTx(chain, tx) {
        const result = await chain.sendPaymentTx(tx);
        console.log(result);
    }
    sendPaymentTx(chain, tx);

    // Send leasing tx to node
    async function sendLeasingTx(chain, tx) {
        const result = await chain.sendLeasingTx(tx);
        console.log(result);
    }
    sendLeasingTx(chain, tx);

    // Send cancel leasing tx to node
    async function sendCancelLeasingTx(chain, tx) {
        const result = await chain.sendCancelLeasingTx(tx);
        console.log(result);
    }
    sendCancelLeasingTx(chain, tx);

    // Send register contract tx to node
    async function sendRegisterContractTxx(chain, tx) {
        const result = await chain.sendRegisterContractTx(tx);
        console.log(result);
    }
    sendRegisterContractTx(chain, tx);

    // Send execute contract tx to node
    async function sendExecuteContractTxx(chain, tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }
    sendExecuteContractTx(chain, tx);
    ```


### account object
1. Create account by seed

    ```javascript
    const vsys = require("@virtualeconomy/js-v-sdk");
    const constants = vsys.constants;
    var acc = new vsys.Account(constants.TESTNET_BYTE);
    acc.buildFromSeed("<your seed>", 0);
    ```

2. Create account by private key

    ```javascript
    const vsys = require("@virtualeconomy/js-v-sdk");
    const constants = vsys.constants;
    var acc = new vsys.Account(constants.TESTNET_BYTE);
    acc.buildFromPrivateKey("<private key>");
    ```

3. Create account by public key

    ```javascript
    const vsys = require("@virtualeconomy/js-v-sdk");
    const constants = vsys.constants;
    var acc = new vsys.Account(constants.TESTNET_BYTE);
    acc.buildColdWallet("<public key>", '');
    ```

4. Create account by address

    ```javascript
    const vsys = require("@virtualeconomy/js-v-sdk");
    const constants = vsys.constants;
    var acc = new vsys.Account(constants.TESTNET_BYTE);
    acc.buildColdWallet('', "<address>");
    ```
5. Methods in account object

    ```javascript
    // acc: your account object

    // Get address
    let address = acc.getAddress();
    console.log(address);

    // Get public key
    let publicKey = acc.getPublicKey();
    console.log(publicKey);

    // Get private key
    let privateKey = acc.getPrivateKey();
    console.log(privateKey);

    // Get signature
    let signature = acc.getSignature("<data bytes>");
    console.log(signature);

    // Check address
    let is_valid_address = acc.checkAddress("<address>");
    console.log(is_valid_address);

    // Convert public key to address
    // network byte: constants.TESTNET_BYTE or constants.MAINNET_BYTE
    let address = acc.convertPublicKeyToAddress("<public key>", "<network byte>");
    console.log(address);

    // Send transaction tx to node (you can know more details in 'send transaction' part)
    async function sendTransaction(acc, tx, node) {
        const result = await acc.sendTransaction(node, tx);
        console.log(result);
    }
    sendTransaction(acc, "<tx>", "<blockchain object>");
    ```

### transaction object
1. Build transaction object

    ```javascript
    const vsys = require("@virtualeconomy/js-v-sdk");
    var constants = vsys.constants;
    const network_byte = constants.TESTNET_BYTE;
    var tra = new vsys.Transaction(network_byte);
    ```

2. Some methods in transaction object

    ```javascript
    // Get bytes of json, but you need to build valid tx first.
    let bytes = tra.toBytes();
    console.log(bytes);

    // Get json for cold signature
    let cold_tx = tra.toJsonForColdSignature();
    console.log(cold_tx);

    // Get json for sending tx
    let send_tx = tra.toJsonForSendingTx("<signature>");
    console.log(send_tx);

    // Build transaction id
    let bytes = tra.toBytes();
    let transaction_id = buildTransactionId(bytes);
    console.log(transaction_id);
    ```


### send transaction
1. Send Payment transaction

    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const node_address = "http://test.v.systems:9922"; // change to your node address

    async function sendPaymentTx(tx) {
        // const result = await chain.sendPaymentTx(tx);
        const result = await acc.sendTransaction(chain, tx);
        console.log(result);
    }

    // Create Transaction Object
    let public_key = acc.getPublicKey();
    let timestamp = Date.now() * 1e6;
    tra.buildPaymentTx(public_key, "<recipient address>", "<amount>", "<attachment>", timestamp);

    // Get bytes
    let bytes = tra.toBytes();

    // Get signature
    let signature = acc.getSignature(bytes);

    // Get json for sending tx
    let send_tx = tra.toJsonForSendingTx(signature);

    // Send transaction
    sendPaymentTx(send_tx);

    // You can also get json for cold siganture
    let cold_tx = tra.toJsonForColdSignature();
    console.log('Json for cold signature:');
    console.log(cold_tx);
    ```

2. Send Lease transaction

    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const node_address = "http://test.v.systems:9922"; // change to your node address

    async function sendLeasingTx(tx) {
        // const result = await chain.sendLeasingTx(tx);
        const result = await acc.sendTransaction(chain, tx);
        console.log(result);
    }

    // Create Transaction Object
    let public_key = acc.getPublicKey();
    let timestamp = Date.now() * 1e6;
    tra.buildLeasingTx(public_key, "<recipient address>", "<amount>", timestamp);

    // Get bytes
    let bytes = tra.toBytes();

    // Get signature
    let signature = acc.getSignature(bytes);

    // Get json for sending tx
    let send_tx = tra.toJsonForSendingTx(signature);

    // Send transaction
    sendLeasingTx(send_tx);

    // You can also get json for cold siganture
    let cold_tx = tra.toJsonForColdSignature();
    console.log('Json for cold signature:');
    console.log(cold_tx);
    ```

3. Send Cancel Lease transaction

    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const node_address = "http://test.v.systems:9922"; // change to your node address

    async function sendCancelLeasingTx(tx) {
        // const result = await chain.sendCancelLeasingTx(tx);
        const result = await acc.sendTransaction(chain, tx);
        console.log(result);
    }

    // Create Transaction Object
    let public_key = acc.getPublicKey();
    let timestamp = Date.now() * 1e6;
    tra.buildCancelLeasingTx(public_key, "<lease_id>", timestamp);

    // Get bytes
    let bytes = tra.toBytes();

    // Get signature
    let signature = acc.getSignature(bytes);

    // Get json for sending tx
    let send_tx = tra.toJsonForSendingTx(signature);

    // Send transaction
    sendLeasingTx(send_tx);

    // You can also get json for cold siganture
    let cold_tx = tra.toJsonForColdSignature();
    console.log('Json for cold signature:');
    console.log(cold_tx);
    ```

### contract related

1. Register contract (Create token)

    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    var contract_1 = require("../libs/contract");
    const node_address = "http://test.v.systems:9922"; // change to your node address

    async function sendRegisterContractTx(tx) {
        const result = await chain.sendRegisterContractTx(tx);
        console.log(result);
    }

    // Necessary data for creating token, init_data should contain 'amount', 'unity', 'token_description' three keys.
    let contract = contract_1.TOKEN_CONTRACT; // contract_1.TOKEN_CONTRACT_WITH_SPLIT
    let public_key = acc.getPublicKey();
    let amount = "<amount>";
    let unity = "<unity>";
    let token_description = "<description for token>";
    let contract_description = "<description for contract>";
    let timestamp = Date.now() * 1e6;
    let init_data = {amount, unity, token_description};

    // Build contract tx
    tra.buildRegisterContractTx(public_key, contract, init_data, contract_description, timestamp);

    // Get bytes
    let bytes = tra.toBytes();

    // Get signature
    let signature = acc.getSignature(bytes);

    // Get json for sending tx
    let send_tx = tra.toJsonForSendingTx(signature);

    // Send transaction
    sendRegisterContractTx(send_tx);

    // You can also get json for cold signature
    let cold_tx = tra.toJsonForColdSignature();
    console.log('Json for cold signature:');
    console.log(cold_tx);
    ```

2. Execute contract

    Issue token
    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    var contract_1 = require("../libs/contract");
    var constants = require("../libs/constants");
    const node_address = "http://test.v.systems:9922"; // change to your node address

    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for issue token, function_data should contain 'amount', 'unity' two keys, and attachment should be undefined
    let public_key = acc.getPublicKey();
    let amount = "<amount>";
    let unity = "<unity of this token>";
    let timestamp = Date.now() * 1e6;
    let function_data = {amount, unity};
    let attachment = undefined;
    let function_index = constants.ISSUE_FUNCIDX;

    // Build contract tx
    tra.buildExecuteContractTx(public_key, "<contract_id>", function_index, function_data, timestamp, attachment);

    // Get bytes
    let bytes = tra.toBytes();

    // Get signature
    let signature = acc.getSignature(bytes);

    // Get json for sending tx
    let send_tx = tra.toJsonForSendingTx(signature);

    // Send transaction
    sendExecuteContractTx(send_tx);

    // You can also get json for cold signature
    let cold_tx = tra.toJsonForColdSignature();
    console.log('Json for cold signature:');
    console.log(cold_tx);
    ```
    Destroy token
    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    var contract_1 = require("../libs/contract");
    var constants = require("../libs/constants");
    const node_address = "http://test.v.systems:9922"; // change to your node address

    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for destroy token, function_data should contain 'amount', 'unity' two keys, and attachment should be undefined
    let public_key = acc.getPublicKey();
    let amount = "<amount>";
    let unity = "<unity of this token>"; // 1e8
    let timestamp = Date.now() * 1e6;
    let function_data = {amount, unity};
    let attachment = undefined;
    let function_index = constants.DESTROY_FUNCIDX;

    // Build contract tx
    tra.buildExecuteContractTx(public_key, "<contract_id>", function_index, function_data, timestamp, attachment);

    // Get bytes
    let bytes = tra.toBytes();

    // Get signature
    let signature = acc.getSignature(bytes);

    // Get json for sending tx
    let send_tx = tra.toJsonForSendingTx(signature);

    // Send transaction
    sendExecuteContractTx(send_tx);

    // You can also get json for cold signature
    let cold_tx = tra.toJsonForColdSignature();
    console.log('Json for cold signature:');
    console.log(cold_tx);
    ```
    Split token
    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    var contract_1 = require("../libs/contract");
    var constants = require("../libs/constants");
    const node_address = "http://test.v.systems:9922"; // change to your node address

    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for split token, function_data should contain 'new_unity' key, and attachment should be undefined
    let public_key = acc.getPublicKey();
    let new_unity = "<new unity>";
    let timestamp = Date.now() * 1e6;
    let function_data = { new_unity };
    let attachment = undefined;
    let function_index = constants.SPLIT_FUNCIDX;

    // Build contract tx
    tra.buildExecuteContractTx(public_key, "<contract_id>", function_index, function_data, timestamp, attachment);

    // Get bytes
    let bytes = tra.toBytes();

    // Get signature
    let signature = acc.getSignature(bytes);

    // Get json for sending tx
    let send_tx = tra.toJsonForSendingTx(signature);

    // Send transaction
    sendExecuteContractTx(send_tx);

    // You can also get json for cold signature
    let cold_tx = tra.toJsonForColdSignature();
    console.log('Json for cold signature:');
    console.log(cold_tx);
    ```
    Supersede token
    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    var contract_1 = require("../libs/contract");
    var constants = require("../libs/constants");
    const node_address = "http://test.v.systems:9922"; // change to your node address

    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for supersede token, function_data should contain 'new_issuer' key, and attachment should be undefined
    let public_key = acc.getPublicKey();
    let new_issuer = "<new issuer>";
    let timestamp = Date.now() * 1e6;
    let function_data = { new_issuer };
    let attachment = undefined;
    let function_index = constants.SUPERSEDE_FUNCIDX;

    // Build contract tx
    tra.buildExecuteContractTx(public_key, "<contract_id>", function_index, function_data, timestamp, attachment);

    // Get bytes
    let bytes = tra.toBytes();

    // Get signature
    let signature = acc.getSignature(bytes);

    // Get json for sending tx
    let send_tx = tra.toJsonForSendingTx(signature);

    // Send transaction
    sendExecuteContractTx(send_tx);

    // You can also get json for cold signature
    let cold_tx = tra.toJsonForColdSignature();
    console.log('Json for cold signature:');
    console.log(cold_tx);
    ```
    Send token by function buildSendTokenTx ( )
    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    var contract_1 = require("../libs/contract");
    var constants = require("../libs/constants");
    const node_address = "http://test.v.systems:9922"; // change to your node address

    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for send token
    let public_key = acc.getPublicKey();
    let token_id = "<token id>";
    let recipient = "<recipient address>";
    let amount = "<amount>";
    let unity = "<unity of this token>"; //1e8
    let is_split_supported = "<boolean>";
    let attachment = "<attachment>";

    // Build contract tx
    tra.buildSendTokenTx(public_key, token_id, recipient, amount, unity, is_split_supported, attachment);

    // Get bytes
    let bytes = tra.toBytes();

    // Get signature
    let signature = acc.getSignature(bytes);

    // Get json for sending tx
    let send_tx = tra.toJsonForSendingTx(signature);

    // Send transaction
    sendExecuteContractTx(send_tx);

    // You can also get json for cold signature
    let cold_tx = tra.toJsonForColdSignature();
    console.log('Json for cold signature:');
    console.log(cold_tx);
    ```
    Send token
    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    var contract_1 = require("../libs/contract");
    var constants = require("../libs/constants");
    const node_address = "http://test.v.systems:9922"; // change to your node address

    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for send token, function_data should contain 'recipient', 'amount', 'unity' three keys, and attachment should not be undefined
    let public_key = acc.getPublicKey();
    let recipient = "<recipient address>";
    let timestamp = Date.now() * 1e6;
    let amount = "<amount>";
    let unity = "<unity of this token>"; //1e8
    let function_data = {recipient, amount, unity}
    let attachment = "<attachment>";
    let function_index = constants.SEND_FUNCIDX_SPLIT; // constants.SEND_FUNCIDX

    // Build contract tx
    tra.buildExecuteContractTx(public_key, "<contract_id>", function_index, function_data, timestamp, attachment);

    // Get bytes
    let bytes = tra.toBytes();

    // Get signature
    let signature = acc.getSignature(bytes);

    // Get json for sending tx
    let send_tx = tra.toJsonForSendingTx(signature);

    // Send transaction
    sendExecuteContractTx(send_tx);

    // You can also get json for cold signature
    let cold_tx = tra.toJsonForColdSignature();
    console.log('Json for cold signature:');
    console.log(cold_tx);
    ```

## Sample Code and Testing


Sample code please refer these files:


```
// how to build account
test/test_account.js

// how to get information from API
test/test_blockchain.js

// how to register contract and execute contract function
test/test_token.js

// how to send payment、lease、cancel lease transaction and build transaction id
test/test_tx.js
```

Run these commands to test.

```
# Test account
$ npm run test_account

# Test blockchain
$ npm run test_blockchain

# Test token
$ npm run test_token

# Test tx
$ npm run test_tx

# Test all
$ npm run test_all
```

Feel free to modify these test example files. Write your own code as wallet client and integrate into your project.
