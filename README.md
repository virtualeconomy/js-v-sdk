# js-vsystems
JavaScript library for V Systems

## Install from npm （recommended)

  1. install packages

```bash
$ npm i @virtualeconomy/js-v-sdk
```

## Install from git

  1. install node.js (homebrew or https://nodejs.org/)

  2. clone this project as a submodule

``` bash
$ git submodule add https://github.com/virtualeconomy/js-v-sdk.git js-v-sdk
$ git submodule update --init --recursive
```


## Usage

Here we introduce how to use this package installed from npm in detail.

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
    const network_byte = constants.MAINNET_BYTE;
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
    async function sendRegisterContractTx(chain, tx) {
        const result = await chain.sendRegisterContractTx(tx);
        console.log(result);
    }
    sendRegisterContractTx(chain, tx);

    // Send execute contract tx to node
    async function sendExecuteContractTx(chain, tx) {
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

1. Register contract

    (1) Token Contract (Create token)
    
    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const node_address = "http://test.v.systems:9922"; // change to your node address
    let data_generator = new vsys.TokenContractDataGenerator();

    async function sendRegisterContractTx(tx) {
        const result = await chain.sendRegisterContractTx(tx);
        console.log(result);
    }

    // Necessary data for creating token, use vsys.TokenContractDataGenerator.createInitData(amount,unity,token_description) to generate init_data.
    let contract = contract_1.TOKEN_CONTRACT; // contract_1.TOKEN_CONTRACT_WITH_SPLIT
    let public_key = acc.getPublicKey();
    let amount = "<amount>";
    let unity = "<unity>";
    let token_description = "<description for token>";
    let contract_description = "<description for contract>";
    let timestamp = Date.now() * 1e6;
    let init_data = data_generator.createInitData(amount,unity,token_description);

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
    
    (2) Payment Channel Contract
    
    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const node_address = "http://test.v.systems:9922"; // change to your node address
    let data_generator = new vsys.PaymentChannelContractDataGenerator();
 
    async function sendRegisterContractTx(tx) {
        const result = await chain.sendRegisterContractTx(tx);
        console.log(result);
    }

    // Necessary data for payment channel contract, use vsys.PaymentChannelContractDataGenerator.createInitData(token_id) to generate init_data.
    let contract = contract_1.PAYMENT_CONTRACT;
    let public_key = acc.getPublicKey();
    let token_id = "<token_id>";
    let contract_description = "<description for contract>";
    let timestamp = Date.now() * 1e6;
    let init_data = data_generator.createInitData(token_id);

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
    
    (3) Lock Contract
    
    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const node_address = "http://test.v.systems:9922"; // change to your node address
    let data_generator = new vsys.LockContractDataGenerator();

    async function sendRegisterContractTx(tx) {
        const result = await chain.sendRegisterContractTx(tx);
        console.log(result);
    }

    // Necessary data for lock contract, use vsys.LockContractDataGenerator.createInitData(token_id) to generate init_data.
    let contract = contract_1.LOCK_CONTRACT;
    let public_key = acc.getPublicKey();
    let token_id = "<token_id>";
    let contract_description = "<description for contract>";
    let timestamp = Date.now() * 1e6;
    let init_data = data_generator.createInitData(token_id);

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
    
    (4) Non Fungible Contract
    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const node_address = "http://test.v.systems:9922"; // change to your node address
    let data_generator = new vsys.NonFungibleTokenContractDataGenerator();
    
    async function sendRegisterContractTx(tx) {
        const result = await chain.sendRegisterContractTx(tx);
        console.log(result);
    }
 
    // Necessary data for non fungible contract, use vsys.NonFungibleTokenContractDataGenerator.createInitData(token_id) to generate init_data.
    let contract = contract_1.NON_FUNGIBLE_TOKEN_CONTRACT;
    let public_key = acc.getPublicKey();
    let contract_description = "<description for contract>";
    let timestamp = Date.now() * 1e6;
    let init_data = data_generator.createInitData();

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

    Get necessary `function_index` when preparing contract function data.
    ```javascript
    const vsys = require("@virtualeconomy/js-v-sdk");
    let function_index = vsys.getContractFunctionIndex('<contract type>', '<function type>');
    
    /* The types of contracts and related functions currently supported are as follows
    <'Contract Type'> : <'Function Type'>, <'Function Type'>, ...
    Token : SUPERSEDE, ISSUE, DESTROY, SPLIT, SEND, SEND_SPLIT, TRANSFER, TRANSFER_SPLIT, WITHDRAW, WITHDRAW_SPLIT, DEPOSIT, DEPOSIT_SPLIT
    SYSTEM : SEND, TRANSFER, WITHDRAW, DEPOSIT
    LOCK : LOCK
    PAYMENT_CHANNEL : CREATEANDLOAD, EXTENDEXPIRATIONTIME, LOAD, ABORT, UNLOAD, COLLECTPAYMENT
    NFT : SUPERSEDE, ISSUE, SEND, TRANSFER, WITHDRAW, DEPOSIT
    */
    ```
        
    Issue token

    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const constants = vsys.constants;
    const node_address = "http://test.v.systems:9922"; // change to your node address
    let data_generator = new vsys.TokenContractDataGenerator();
 
    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for issue token, use vsys.TokenContractDataGenerator.createIssueData(amount, unity) to generate function_data.
    let public_key = acc.getPublicKey();
    let amount = "<amount>";
    let unity = "<unity of this token>";
    let timestamp = Date.now() * 1e6;
    let function_data = data_generator.createIssueData(amount, unity);
    let attachment = 'issue token';
    let function_index = vsys.getContractFunctionIndex('TOKEN', 'ISSUE');

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
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const constants = vsys.constants;
    const node_address = "http://test.v.systems:9922"; // change to your node address
    let data_generator = new vsys.TokenContractDataGenerator();
 
    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for destroy token, use vsys.TokenContractDataGenerator.createDestroyData(amount, unity) to generate function_data.
    let public_key = acc.getPublicKey();
    let amount = "<amount>";
    let unity = "<unity of this token>"; // 1e8
    let timestamp = Date.now() * 1e6;
    let function_data = data_generator.createDestroyData(amount, unity);
    let attachment = 'destroy token';
    let function_index = vsys.getContractFunctionIndex('TOKEN', 'DESTROY');

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
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const constants = vsys.constants;
    const node_address = "http://test.v.systems:9922"; // change to your node address
    let data_generator = new vsys.TokenContractDataGenerator();
 
    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for split token, use vsys.TokenContractDataGenerator.createSplitData(new_unity) to generate function_data.
    let public_key = acc.getPublicKey();
    let new_unity = "<new unity>";
    let timestamp = Date.now() * 1e6;
    let function_data = data_generator.createSplitData(new_unity);
    let attachment = 'split token';
    let function_index = vsys.getContractFunctionIndex('TOKEN', 'SPLIT');

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
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const constants = vsys.constants;
    const node_address = "http://test.v.systems:9922"; // change to your node address
    let data_generator = new vsys.TokenContractDataGenerator();
 
    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for supersede token, use vsys.TokenContractDataGenerator.createSupersedeData(new_issuer) to generate function_data.
    let public_key = acc.getPublicKey();
    let new_issuer = "<new issuer>";
    let timestamp = Date.now() * 1e6;
    let function_data = data_generator.createSupersedeData(new_issuer);
    let attachment = 'supersede token';
    let function_index = vsys.getContractFunctionIndex('TOKEN', 'SUPERSEDE');

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
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const constants = vsys.constants;
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
    let timestamp = Date.now() * 1e6;

    // Build contract tx
    tra.buildSendTokenTx(public_key, token_id, recipient, amount, unity, is_split_supported, attachment, timestamp);

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
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const constants = vsys.constants;
    const node_address = "http://test.v.systems:9922"; // change to your node address
    let data_generator = new vsys.TokenContractDataGenerator();
 
    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for send token, use vsys.TokenContractDataGenerator.createSendData(recipient, amount, unity) to generate function_data.
    let public_key = acc.getPublicKey();
    let recipient = "<recipient address>";
    let timestamp = Date.now() * 1e6;
    let amount = "<amount>";
    let unity = "<unity of this token>"; //1e8
    let function_data = data_generator.createSendData(recipient, amount, unity);
    let attachment = "<attachment>";
    let function_index = vsys.getContractFunctionIndex('TOKEN', 'SEND_SPLIT'); // constants.SEND_FUNCIDX

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
    
    Transfer token

    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const constants = vsys.constants;
    const node_address = "http://test.v.systems:9922"; // change to your node address
    let data_generator = new vsys.TokenContractDataGenerator();
 
    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for transfer token, user vsys.TokenContractDataGenerator.createTransferData(sender, recipient, amount, unity) to generate function_data.
    let public_key = acc.getPublicKey();
    let sender = "<sender address>"; // acc.getAddress();
    let recipient = "<recipient address>";
    let timestamp = Date.now() * 1e6;
    let amount = "<amount>";
    let unity = "<unity of this token>"; //1e8
    let function_data = data_generator.createTransferData(sender, recipient, amount, unity);
    let attachment = "<attachment>";
    let function_index = vsys.getContractFunctionIndex('TOKEN', 'TRANSFER_SPLIT'); // constants.TRANSFER_FUNCIDX

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
    
    Deposit token

    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const constants = vsys.constants;
    const node_address = "http://test.v.systems:9922"; // change to your node address
    let data_generator = new vsys.TokenContractDataGenerator();
 
    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for deposit token, use vsys.TokenContractDataGenerator.createDepositData(sender, smart_contract, amount, unity) to generate function_data.
    let public_key = acc.getPublicKey();
    let sender = "<sender address>"; // acc.getAddress();
    let timestamp = Date.now() * 1e6;
    let amount = "<amount>";
    let unity = "<unity of this token>"; //1e8
    let smart_contract = "<smart contract id>"; // This contract should be payment channel contract or lock contract
    let function_data = data_generator.createDepositData(sender, smart_contract, amount, unity);
    let attachment = "<attachment>";
    let function_index = vsys.getContractFunctionIndex('TOKEN', 'DEPOSIT_SPLIT'); // constants.DEPOSIT_FUNCIDX

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

    Withdraw token

    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const constants = vsys.constants;
    const node_address = "http://test.v.systems:9922"; // change to your node address
    let data_generator = new vsys.TokenContractDataGenerator();
 
    async function sendExecuteContractTx(tx) {
        const result = await chain.sendExecuteContractTx(tx);
        console.log(result);
    }

    // Necessary data for withdraw token, use vsys.TokenContractDataGenerator.createWithdrawData(smart_contract, recipient, amount, unity) to generate function_data.
    let public_key = acc.getPublicKey();
    let recipient = "<recipient address>";
    let timestamp = Date.now() * 1e6;
    let amount = "<amount>";
    let unity = "<unity of this token>"; //1e8
    let smart_contract = "<smart contract id>"; // This contract should be payment channel contract or lock contract
    let function_data = data_generator.createWithdrawData(smart_contract, recipient, amount, unity);
    let attachment = "<attachment>";
    let function_index = vsys.getContractFunctionIndex('TOKEN', 'WITHDRAW_SPLIT'); // constants.WITHDRAW_FUNCIDX

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

# Test system contract
$ npm run test_system_contract

# Test payment channel contract
$ npm run test_payment_channel_contract

# Test lock contract
$ npm run test_lock_contract

# Test non fungible contract
$ npm run test_nft_contract

# Test all
$ npm run test_all
```

Feel free to modify these test example files. Write your own code as wallet client and integrate into your project.
