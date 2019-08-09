"use strict";
import BigNumber from 'bignumber.js'
import Base58 from 'base-58';
import Convert from './convert';
import Crypto from './crypto'
export default {
    getLength(str) {
        let len = encodeURIComponent(str).replace(/%[A-F\d]{2}/g, 'U').length;
        return len
    },
    checkPrecision(amount, unity) {
        // return false if check failed
        amount = BigNumber(amount)
        let m = amount.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/)
        amount = amount.toFixed(Math.max(0, (m[1] || '').length - m[2]))
        return !(amount.toString().split('.')[1] && amount.toString().split('.')[1].length > unity)
    },
    isNumFormatValid(amount) {
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
    contractIDToTokenID(contraId) {

        var conId = Base58.decode(contraId)
        var firstArr = [132]
        var secondArr = Array.from(conId.slice(1,conId.length-4))
        var thirdArr = Convert.idxToByteArray(0)
        var encodeArr = firstArr.concat(secondArr.concat(thirdArr))
        var hashArr = Crypto.hash(Uint8Array.from(encodeArr))
        var checkArr = hashArr.slice(0, 4)
        var tokenArr = encodeArr.concat(checkArr)
        var tokenString = Base58.encode(tokenArr)
        return tokenString
    },
    tokenIDToContractID(tokenId) {
        var tokenArr = Base58.decode(tokenId)
        var firstArr = [6]
        var secondArr = Array.from(tokenArr.slice(1,tokenArr.length-8))
        var encodeArr = firstArr.concat(secondArr)
        var hashArr = Crypto.hash(Uint8Array.from(encodeArr))
        var checkArr = hashArr.slice(0, 4)
        var contractArr = encodeArr.concat(checkArr)
        var contractString = Base58.encode(contractArr)
        return contractString
    }
}
