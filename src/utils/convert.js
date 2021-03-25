"use strict";
// Derived from waves-api
//
// Object.defineProperty(exports, "__esModule", { value: true });
import bignumber_1 from 'bignumber.js';
import converters_1 from './converters';
import Base58 from 'base-58';
import Crypto from './crypto';
import Common from './common';
import * as Constants from '../constants';
import { TOKEN, SPLITTABLE_TOKEN, LOCK, PAYMENT_CHANNEL, SYSTEM, NFT } from  '../contract_type';
import { issue, destroy, send, split, abort, collectPayment, createAndLoad, deposit, extendExpirationTime, load, lock, supersede, transfer, unload, withdraw} from "../contract_function_type";

function performBitwiseAnd(a, b) {
    let sa = a.toString(2).split('.')[0];
    let sb = b.toString(2).split('.')[0];
    let len = Math.min(sa.length, sb.length);
    let s1 = sa.slice(sa.length - len);
    let s2 = sb.slice(sb.length - len);
    let result = new Array(len);
    for (let i = len - 1; i >= 0; i--) {
        result[i] = (s1[i] === '1' && s2[i] === '1') ? '1' : '0';
    }
    return parseInt(result.join(''), 2);
}
function parseAmountData(bytes, bytes_length) {
    let result = ''
    for (let k = 0; k < bytes_length; k++) {
        let len = 8 - bytes[k].toString(2).length
        result += '0'.repeat(len) + bytes[k].toString(2)
    }
    return bytes_length === 8 ? bignumber_1.default(result, 2) : bignumber_1.default(result, 2).toNumber()
}
function checkFunctionData(functionType, parsedData) {
    let length = parsedData.length
    switch (functionType) {
        case supersede:
            if (length !== 1 || parsedData[0]['type'] !== Constants.ACCOUNT_ADDR_TYPE) throw new Error('Invalid functionData')
            break
        case issue:
            if (length !== 1 || !(parsedData[0]['type'] === Constants.SHORTTEXT_TYPE || parsedData[0]['type'] === Constants.AMOUNT_TYPE)) throw new Error('Invalid functionData')
            break
        case destroy:case split:
            if (length !== 1 || parsedData[0]['type'] !== Constants.AMOUNT_TYPE) throw new Error('Invalid functionData')
            break
        case send:
            if (length !== 2 || parsedData[0]['type'] !== Constants.ACCOUNT_ADDR_TYPE || !(parsedData[1]['type'] === Constants.INT32_TYPE || parsedData[1]['type'] === Constants.AMOUNT_TYPE)) throw new Error('Invalid functionData')
            break
        case transfer:
            if (length !== 3 || !(parsedData[0]['type'] === Constants.CONTRACT_ACCOUNT_TYPE || parsedData[0]['type'] === Constants.ACCOUNT_ADDR_TYPE) || !(parsedData[1]['type'] === Constants.CONTRACT_ACCOUNT_TYPE || parsedData[1]['type'] === Constants.ACCOUNT_ADDR_TYPE) || !(parsedData[2]['type'] === Constants.AMOUNT_TYPE || parsedData[2]['type'] === Constants.INT32_TYPE)) throw new Error('Invalid functionData')
            break
        case deposit:
            if (length !== 3 || parsedData[0]['type'] !== Constants.ACCOUNT_ADDR_TYPE || parsedData[0]['type'] !== Constants.CONTRACT_ACCOUNT_TYPE || !(parsedData[2]['type'] === Constants.AMOUNT_TYPE || parsedData[2]['type'] === Constants.INT32_TYPE)) throw new Error('Invalid functionData')
            break
        case withdraw:
            if (length !== 3 || parsedData[0]['type'] !== Constants.CONTRACT_ACCOUNT_TYPE || parsedData[0]['type'] !== Constants.ACCOUNT_ADDR_TYPE || !(parsedData[2]['type'] === Constants.AMOUNT_TYPE || parsedData[2]['type'] === Constants.INT32_TYPE)) throw new Error('Invalid functionData')
            break
        case lock:
            if (length !== 1 || parsedData[0]['type'] !== Constants.TIME_STAMP_TYPE) throw new Error('Invalid functionData')
            break
        case createAndLoad:
            if (length !== 3 || parsedData[0]['type'] !== Constants.ACCOUNT_ADDR_TYPE || parsedData[1]['type'] !== Constants.AMOUNT_TYPE || parsedData[2]['type'] !== Constants.TIME_STAMP_TYPE) throw new Error('Invalid functionData')
            break
        case extendExpirationTime:
            if (length !== 2 || parsedData[0]['type'] !== Constants.SHORT_BYTES_TYPE || parsedData[1]['type'] !== Constants.TIME_STAMP_TYPE) throw new Error('Invalid functionData')
            break
        case load:
            if (length !== 2 || parsedData[0]['type'] !== Constants.SHORT_BYTES_TYPE || parsedData[1]['type'] !== Constants.AMOUNT_TYPE) throw new Error('Invalid functionData')
            break
        case abort:case unload:
            if (length !== 1 || parsedData[0]['type'] !== Constants.SHORT_BYTES_TYPE) throw new Error('Invalid functionData')
            break
        case collectPayment:
            if (length !== 3 || parsedData[0]['type'] !== Constants.SHORT_BYTES_TYPE || parsedData[1]['type'] !== Constants.AMOUNT_TYPE || parsedData[2]['type'] !== Constants.SHORT_BYTES_TYPE) throw new Error('Invalid functionData')
            break
        default:
            throw new Error('Unsupported function type')
    }
}
const Convert = {
    booleanToBytes: function (input) {
        if (typeof input !== 'boolean') {
            throw new Error('Boolean input is expected');
        }
        return input ? [1] : [0];
    },
    bytesToByteArrayWithSize: function (input) {
        this.throwBytesException(input);
        if (!(input instanceof Array)) {
            input = Array.prototype.slice.call(input);
        }
        let lengthBytes = converters_1.int16ToBytes(input.length, true);
        return lengthBytes.concat(input);
    },
    shortToByteArray: function (input) {
        if (typeof input !== 'number') {
            throw new Error('Numeric input is expected');
        }
        return converters_1.int16ToBytes(input, true);
    },
    longToByteArray: function (input) {
        if (typeof input !== 'number') {
            throw new Error('Numeric input is expected');
        }
        let bytes = new Array(7);
        for (let k = 7; k >= 0; k--) {
            bytes[k] = input & (255);
            input = input / 256;
        }
        return bytes;
    },
    idxToByteArray: function (input) {
        return converters_1.int32ToBytes(input, true);
    },
    byteArrayToShort: function (bytes) {
        this.throwBytesException(bytes);
        return converters_1.byteArrayToSignedShort(bytes);
    },
    byteArrayToInt: function (bytes) {
        this.throwBytesException(bytes);
        return converters_1.byteArrayToSignedInt32(bytes);
    },
    byteArrayToLong: function (bytes) {
        this.throwBytesException(bytes);
        return converters_1.byteArrayToSignedInt64(bytes);
    },
    byteArrayToString: function (bytes) {
        this.throwBytesException(bytes);
        return converters_1.byteArrayToString(bytes);
    },
    throwBytesException: function (bytes) {
        if (!(bytes instanceof Array || bytes instanceof Uint8Array)) {
            throw new Error('Byte array or Uint8Array input is expected');
        }
        else if (bytes instanceof Array && !(bytes.every(function (n) { return typeof n === 'number'; }))) {
            throw new Error('Byte array contains non-numeric elements');
        }
        return
    },
    bigNumberToByteArray: function (input) {
        if (!(input instanceof bignumber_1.default)) {
            throw new Error('BigNumber input is expected');
        }
        let performBitwiseAnd255 = performBitwiseAnd.bind(null, new bignumber_1.default(255));
        let bytes = new Array(7);
        for (let k = 7; k >= 0; k--) {
            bytes[k] = performBitwiseAnd255(input);
            input = input.div(256);
        }
        return bytes;
    },
    parseFunctionData: function (base_string) {
        let bytes = Base58.decode(base_string)
        let parameters_num = bytes[1]
        bytes = bytes.slice(2)
        let function_data = []
        for (let i = 0; i < parameters_num; i++) {
            let type = bytes[0]
            if (type === 1) {
                function_data.push({'data': Base58.encode(bytes.slice(1, 33)), 'type': type})
                bytes = bytes.slice(33)
            } else if (type === 2 || type === 6 || type === 7) {
                function_data.push({'data': Base58.encode(bytes.slice(1, 27)), 'type': type})
                bytes = bytes.slice(27)
            } else if (type === 3) {
                function_data.push({'data': parseAmountData(bytes.slice(1, 9), 8), 'type': type})
                bytes = bytes.slice(9)
            } else if (type === 4) {
                function_data.push({'data': parseAmountData(bytes.slice(1, 5), 4), 'type': type})
                bytes = bytes.slice(5)
            }
            else if (type === 5) {
                let short_text_length = bytes[2]
                function_data.push({'data': converters_1.byteArrayToString(bytes.slice(3, short_text_length + 3)), 'type': type})
                bytes = bytes.slice(short_text_length + 3)
            } else if (type === 8) {
                function_data.push({'data':Base58.encode(bytes.slice(1)), 'type': type})
            } else if (type === 9) {
                function_data.push({'data': parseAmountData(bytes.slice(1, 9), 8).toNumber(), 'type': type})
                bytes = bytes.slice(9)
            } else if (type === 11) {
                let short_bytes_length = bytes[2]
                function_data.push({'data': Base58.encode(bytes.slice(3, short_bytes_length + 3)), 'type': type})
                bytes = bytes.slice(short_bytes_length + 3)
            } else {
                throw new Error('Wrong parameter type')
            }
        }
        return function_data
    },
    parseExecutionData(contractType, functionIndex, functionData) {
        let functionType
        let returnData = {}
        let Data = this.parseFunctionData(functionData)
        switch (contractType) {
            case TOKEN:
                switch (functionIndex) {
                    case Constants.SUPERSEDE_FUNCIDX:
                        functionType = supersede
                        checkFunctionData(functionType, Data)
                        returnData = {'newIssuer': Data[0]['data']}
                        break
                    case Constants.ISSUE_FUNCIDX:
                        functionType = issue
                        checkFunctionData(functionType, Data)
                        returnData = {'amount': Data[0]['data']}
                        break
                    case Constants.DESTROY_FUNCIDX:
                        functionType = destroy
                        checkFunctionData(functionType, Data)
                        returnData = {'amount': Data[0]['data']}
                        break
                    case Constants.SEND_FUNCIDX:
                        functionType = send
                        checkFunctionData(functionType, Data)
                        returnData = {'recipient': Data[0]['data'], 'amount': Data[1]['data']}
                        break
                    case Constants.TRANSFER_FUNCIDX:
                        functionType = transfer
                        checkFunctionData(functionType, Data)
                        returnData = {
                            'sender': Data[0]['data'],
                            'recipient': Data[1]['data'],
                            'amount': Data[2]['data']
                        }
                        break
                    case Constants.WITHDRAW_FUNCIDX:
                        functionType = withdraw
                        checkFunctionData(functionType, Data)
                        returnData = {
                            'contract': Data[0]['data'],
                            'recipient': Data[1]['data'],
                            'amount': Data[2]['data']
                        }
                        break
                    case Constants.DEPOSIT_FUNCIDX:
                        functionType = deposit
                        checkFunctionData(functionType, Data)
                        returnData = {'sender': Data[0]['data'], 'contract': Data[1]['data'], 'amount': Data[2]['data']}
                        break
                    default:
                        throw new Error('Wrong functionIndex in ' + TOKEN)
                }
                break
            case SPLITTABLE_TOKEN:
                switch (functionIndex) {
                    case Constants.SUPERSEDE_FUNCIDX:
                        functionType = supersede
                        checkFunctionData(functionType, Data)
                        returnData = {'newIssuer': Data[0]['data']}
                        break
                    case Constants.ISSUE_FUNCIDX:
                        functionType = issue
                        checkFunctionData(functionType, Data)
                        returnData = {'amount': Data[0]['data']}
                        break
                    case Constants.DESTROY_FUNCIDX:
                        functionType = destroy
                        checkFunctionData(functionType, Data)
                        returnData = {'amount': Data[0]['data']}
                        break
                    case Constants.SPLIT_FUNCIDX:
                        functionType = split
                        checkFunctionData(functionType, Data)
                        returnData = {'amount': Data[0]['data']}
                        break
                    case Constants.SEND_FUNCIDX_SPLIT:
                        functionType = send
                        checkFunctionData(functionType, Data)
                        returnData = {'recipient': Data[0]['data'], 'amount': Data[1]['data']}
                        break
                    case Constants.TRANSFER_FUNCIDX_SPLIT:
                        functionType = transfer
                        checkFunctionData(functionType, Data)
                        returnData = {
                            'sender': Data[0]['data'],
                            'recipient': Data[1]['data'],
                            'amount': Data[2]['data']
                        }
                        break
                    case Constants.WITHDRAW_FUNCIDX_SPLIT:
                        functionType = withdraw
                        checkFunctionData(functionType, Data)
                        returnData = {
                            'contract': Data[0]['data'],
                            'recipient': Data[1]['data'],
                            'amount': Data[2]['data']
                        }
                        break
                    case Constants.DEPOSIT_FUNCIDX_SPLIT:
                        functionType = deposit
                        checkFunctionData(functionType, Data)
                        returnData = {'sender': Data[0]['data'], 'contract': Data[1]['data'], 'amount': Data[2]['data']}
                        break
                    default:
                        throw new Error('Wrong functionIndex in ' + SPLITTABLE_TOKEN)
                }
                break
            case SYSTEM:
                switch (functionIndex) {
                    case Constants.SYSTEM_CONTRACT_SEND_FUNCIDX:
                        functionType = send
                        checkFunctionData(functionType, Data)
                        returnData = {'recipient': Data[0]['data'], 'amount': Data[1]['data']}
                        break
                    case Constants.SYSTEM_CONTRACT_TRANSFER_FUNCIDX:
                        functionType = transfer
                        checkFunctionData(functionType, Data)
                        returnData = {
                            'sender': Data[0]['data'],
                            'recipient': Data[1]['data'],
                            'amount': Data[2]['data']
                        }
                        break
                    case Constants.SYSTEM_CONTRACT_WITHDRAW_FUNCIDX:
                        functionType = withdraw
                        checkFunctionData(functionType, Data)
                        returnData = {
                            'contract': Data[0]['data'],
                            'recipient': Data[1]['data'],
                            'amount': Data[2]['data']
                        }
                        break
                    case Constants.SYSTEM_CONTRACT_DEPOSIT_FUNCIDX:
                        functionType = deposit
                        checkFunctionData(functionType, Data)
                        returnData = {'sender': Data[0]['data'], 'contract': Data[1]['data'], 'amount': Data[2]['data']}
                        break
                    default:
                        throw new Error('Wrong functionIndex in ' + SYSTEM)
                }
                break
            case LOCK:
                if (functionIndex === Constants.LOCK_CONTRACT_LOCK_FUNCIDX) {
                    functionType = lock
                    checkFunctionData(functionType, Data)
                    returnData = {'timestamp': Data[0]['data']}
                } else throw new Error('Wrong functionIndex in ' + LOCK)
                break
            case PAYMENT_CHANNEL:
                switch (functionIndex) {
                    case Constants.PAYMENTCHANNEL_CONTRACT_CREATEANDLOAD_FUNCIDX:
                        functionType = createAndLoad
                        checkFunctionData(functionType, Data)
                        returnData = {
                            'recipient': Data[0]['data'],
                            'amount': Data[1]['data'],
                            'expirationTime': Data[2]['data']
                        }
                        break
                    case Constants.PAYMENTCHANNEL_CONTRACT_EXTENDEXPIRATIONTIME_FUNCIDX:
                        functionType = extendExpirationTime
                        checkFunctionData(functionType, Data)
                        returnData = {'channelId': Data[0]['data'], 'expirationTime': Data[1]['data']}
                        break
                    case Constants.PAYMENTCHANNEL_CONTRACT_LOAD_FUNCIDX:
                        functionType = load
                        checkFunctionData(functionType, Data)
                        returnData = {'channelId': Data[0]['data'], 'amount': Data[1]['data']}
                        break
                    case Constants.PAYMENTCHANNEL_CONTRACT_ABORT_FUNCIDX:
                        functionType = abort
                        checkFunctionData(functionType, Data)
                        returnData = {'channelId': Data[0]['data']}
                        break
                    case Constants.PAYMENTCHANNEL_CONTRACT_UNLOAD_FUNCIDX:
                        functionType = unload
                        checkFunctionData(functionType, Data)
                        returnData = {'channelId': Data[0]['data']}
                        break
                    case Constants.PAYMENTCHANNEL_CONTRACT_COLLECTPAYMENT_FUNCIDX:
                        functionType = collectPayment
                        checkFunctionData(functionType, Data)
                        returnData = {
                            'channelId': Data[0]['data'],
                            'amount': Data[1]['data'],
                            'signature': Data[2]['data']
                        }
                        break
                    default:
                        throw new Error('Wrong functionIndex in ' + PAYMENT_CHANNEL)

                }
                break
            case NFT:
                switch (functionIndex) {
                    case Constants.NFT_CONTRACT_SUPERSEDE_FUNCIDX:
                        functionType = supersede
                        checkFunctionData(functionType, Data)
                        returnData = {'newIssuer': Data[0]['data']}
                        break
                    case Constants.NFT_CONTRACT_ISSUE_FUNCIDX:
                        functionType = issue
                        checkFunctionData(functionType, Data)
                        returnData = {'tokenDescription': Data[0]['data']}
                        break
                    case Constants.NFT_CONTRACT_SEND_FUNCIDX:
                        functionType = send
                        checkFunctionData(functionType, Data)
                        returnData = {'recipient': Data[0]['data'], 'tokenIndex': Data[1]['data']}
                        break
                    case Constants.NFT_CONTRACT_TRANSFER_FUNCIDX:
                        functionType = transfer
                        checkFunctionData(functionType, Data)
                        returnData = {
                            'sender': Data[0]['data'],
                            'recipient': Data[1]['data'],
                            'tokenIndex': Data[2]['data']
                        }
                        break
                    case Constants.NFT_CONTRACT_WITHDRAW_FUNCIDX:
                        functionType = withdraw
                        checkFunctionData(functionType, Data)
                        returnData = {
                            'contract': Data[0]['data'],
                            'recipient': Data[1]['data'],
                            'amount': Data[2]['data']
                        }
                        break
                    case Constants.NFT_CONTRACT_DEPOSIT_FUNCIDX:
                        functionType = deposit
                        checkFunctionData(functionType, Data)
                        returnData = {'sender': Data[0]['data'], 'contract': Data[1]['data'], 'amount': Data[2]['data']}
                        break
                    default:
                        throw new Error('Wrong functionIndex in ' + NFT)
                }
                break;
            default:
                throw new Error('Unsupported contract type')
        }
        return { functionType: functionType, functionData: returnData }
    },
    stringToByteArray: function (input) {
        if (typeof input !== 'string') {
            throw new Error('String input is expected');
        }
        return converters_1.stringToByteArray(input);
    },
    stringToByteArrayWithSize: function (input) {
        if (typeof input !== 'string') {
            throw new Error('String input is expected');
        }
        let stringBytes = converters_1.stringToByteArray(input);
        let lengthBytes = converters_1.int16ToBytes(stringBytes.length, true);
        return lengthBytes.concat(stringBytes);
    },
    getTokenIndex(tokenId) {
        return Common.getTokenIndex(tokenId);
    },
    contractIDToTokenID(contraId, tokenIndex=0) {
        return Common.contractIDToTokenID(contraId, tokenIndex);
    },
    tokenIDToContractID(tokenId) {
        return Common.tokenIDToContractID(tokenId);
    }
};

export default Convert;
//# sourceMappingURL=convert.js.map
