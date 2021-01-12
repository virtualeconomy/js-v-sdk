"use strict";
import BigNumber from 'bignumber.js'
import Base58 from 'base-58';
import Convert from './convert';
import Converters from './converters';
import Crypto from './crypto'
export default {
    getLength(str) {
        let len = encodeURIComponent(str).replace(/%[A-F\d]{2}/g, 'U').length;
        return len
    },
    checkPrecision(amount, unity) {
        // return false if check failed
        amount = BigNumber(amount)
        if(BigNumber(amount).isNaN()){
            return true;
        }
        let m = amount.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/)
        amount = amount.toFixed(Math.max(0, (m[1] || '').length - m[2]))
        return !(amount.toString().split('.')[1] && amount.toString().split('.')[1].length > unity)
    },
    isValidNumFormat(amount) {
        return !(/[eE]/.test(amount.toString()) || (/^[0+]/.test(amount.toString()) && !/^0\./.test(amount.toString()))|| BigNumber(amount).isNaN())
    },
    concatUint8Arrays() {
        let args = [];
        for (let _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length < 2) {
            return args[0];
        }
        if (!(args.every(function (arg) { return arg instanceof Uint8Array; }))) {
            throw new Error('One of arguments is not a Uint8Array');
        }
        let count = args.length;
        let sumLength = args.reduce(function (sum, arr) { return sum + arr.length; }, 0);
        let result = new Uint8Array(sumLength);
        let curLength = 0;
        for (let i = 0; i < count; i++) {
            result.set(args[i], curLength);
            curLength += args[i].length;
        }
        return result;
    },
    getTokenIndex(tokenId) {
        let tokId = Base58.decode(tokenId)
        let indexBytes = Array.from(tokId.slice(tokId.length-8, tokId.length-4)).reverse()
        let index = Converters.byteArrayToSignedInt32(indexBytes)
        return index
    },
    getContractKeyString(index, key) {
        let stateIndex = new Uint8Array([index, 2])
        let addrBytes = Base58.decode(key)
        let bytes = new Uint8Array(stateIndex.length + addrBytes.length )
        bytes.set(stateIndex)
        bytes.set(addrBytes, stateIndex.length)
        return Base58.encode(bytes)
    },
    contractIDToTokenID(contraId, tokenIndex=0) {
        let conId = Base58.decode(contraId)
        let firstArr = [132]
        let secondArr = Array.from(conId.slice(1,conId.length-4))
        let thirdArr = Convert.idxToByteArray(tokenIndex)
        let encodeArr = firstArr.concat(secondArr.concat(thirdArr))
        let hashArr = Crypto.hash(Uint8Array.from(encodeArr))
        let checkArr = hashArr.slice(0, 4)
        let tokenArr = encodeArr.concat(checkArr)
        let tokenString = Base58.encode(tokenArr)
        return tokenString
    },
    tokenIDToContractID(tokenId) {
        let tokenArr = Base58.decode(tokenId)
        let firstArr = [6]
        let secondArr = Array.from(tokenArr.slice(1,tokenArr.length-8))
        let encodeArr = firstArr.concat(secondArr)
        let hashArr = Crypto.hash(Uint8Array.from(encodeArr))
        let checkArr = hashArr.slice(0, 4)
        let contractArr = encodeArr.concat(checkArr)
        let contractString = Base58.encode(contractArr)
        return contractString
    }
}
