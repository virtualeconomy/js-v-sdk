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

Here we briefly introduce how to use this package installed from npm. If you want more details on how to use it, please refer to [JSVSYSTEMS User Guide Specification](https://github.com/virtualeconomy/js-v-sdk/wiki/JavaScript-library-for-V-Systems) 

### chain object

1. For testnet chain:

    ```javascript
    const vsys = require("@virtualeconomy/js-v-sdk");
    const constants = vsys.constants;
    const node_address = "https://test.v.systems/api"; // change to your node address
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
3. Some methods in chain object:

    ```javascript
    // Get Balance
    async function getBalance(chain, address) {
        let result = await chain.getBalance(address);
        console.log(result);
    }
    getBalance(chain, "<address>");

    // Get address's token balance
    async function getTokenBalance(chain, address, token_id) {
        const result = await chain.getTokenBalance(address, token_id);
        console.log(result);
    }
    getTokenBalance(chain, "<address>", "<token_id>");
    ```


### account object
1. Create account by seed

    ```javascript
    const vsys = require("@virtualeconomy/js-v-sdk");
    const constants = vsys.constants;
    var acc = new vsys.Account(constants.TESTNET_BYTE);
    acc.buildFromSeed("<your seed>", 0);
    ```
  
2. Some methods in account object

    ```javascript
    // acc: your account object

    // Get address
    let address = acc.getAddress();
    console.log(address);

    // Get public key
    let publicKey = acc.getPublicKey();
    console.log(publicKey);
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

    ```


### send transaction
1. Send Payment transaction

    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const node_address = "https://test.v.systems/api"; // change to your node address

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
    const node_address = "https://test.v.systems/api"; // change to your node address

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

### contract related

1. Register contract

    Token Contract (Create token)
    
    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const node_address = "https://test.v.systems/api"; // change to your node address
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
   
2. Execute contract

    Get necessary `function_index` when preparing contract function data.
    ```javascript
    const vsys = require("@virtualeconomy/js-v-sdk");
    const ContractType = vsys.ContractType;
    let function_index = vsys.getContractFunctionIndex('<contract type>', '<function name>');
    
    /* The types of contracts and related functions currently supported are as follows
    
    const variable `ContractType` includes TOKEN, SPLITTABLE_TOKEN, SYSTEM, LOCK, PAYMENT_CHANNEL, NFT
    usage: ContractType.TOKEN

    <'Contract Type'> : <'Function Type'>, <'Function Name'>, ...
    TOKEN : SUPERSEDE, ISSUE, DESTROY, SEND, TRANSFER, WITHDRAW, DEPOSIT
    SPLITTABLE_TOKEN: SUPERSEDE, ISSUE, DESTROY, SPLIT, SEND, TRANSFER, WITHDRAW, DEPOSIT
    SYSTEM : SEND, TRANSFER, WITHDRAW, DEPOSIT
    LOCK : LOCK
    PAYMENT_CHANNEL : CREATEANDLOAD, EXTENDEXPIRATIONTIME, LOAD, ABORT, UNLOAD, COLLECTPAYMENT
    NFT : SUPERSEDE, ISSUE, SEND, TRANSFER, WITHDRAW, DEPOSIT
    */
    ```

    Send token

    ```javascript
    // tra: your transaction object, acc: your account object, chain: your blockchain object, build them first!
    const vsys = require("@virtualeconomy/js-v-sdk");
    const contract_1 = vsys.Contract;
    const constants = vsys.constants;
    const node_address = "https://test.v.systems/api"; // change to your node address
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
    let function_index = vsys.getContractFunctionIndex(vsys.ContractType.SPLITTABLE_TOKEN, 'SEND'); // constants.SEND_FUNCIDX

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
