import BigNumber from "bignumber.js";
import * as Constants from "./constants";

export default class DataEntry {

    tokenContractDataGen(amount, unity, des) {
        let max = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.AMOUNT_TYPE, value: max},
            { type: Constants.AMOUNT_TYPE, value: BigNumber(unity).toString()},
            { type: Constants.SHORTTEXT_TYPE, value: des}
        ]
        return data
    }

    paymentContractDataGen(token_id) {
        return [{ type: Constants.TOKEN_ID_TYPE, value: token_id}]
    }

    lockContractDataGen(token_id) {
        return [{ type: Constants.TOKEN_ID_TYPE, value: token_id}]
    }

    issueDataGen(amount, unity) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.AMOUNT_TYPE, value: amount }
        ]
        return data
    }

    destroyDataGen(amount, unity) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.AMOUNT_TYPE, value: amount }
        ]
        return data
    }

    splitDataGen(unity) {
        return [{ type: Constants.AMOUNT_TYPE, value: BigNumber(unity).toString()}]
    }

    supersedeDataGen(issuer) {
        return [{ type: Constants.ACCOUNT_ADDR_TYPE, value: issuer}]
    }

    sendDataGen(recipient, amount, unity) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient},
            { type: Constants.AMOUNT_TYPE, value: amount}
        ]
        return data
    }

    transferDataGen(sender, recipient, amount, unity) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.ACCOUNT_ADDR_TYPE, value: sender},
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient},
            { type: Constants.AMOUNT_TYPE, value: amount}
        ]
        return data
    }

    depositDataGen(sender, contract, amount, unity) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.ACCOUNT_ADDR_TYPE, value: sender},
            { type: Constants.CONTRACT_ACCOUNT_TYPE, value: contract},
            { type: Constants.AMOUNT_TYPE, value: amount}
        ]
        return data
    }

    withdrawDataGen(contract, recipient, amount, unity) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.CONTRACT_ACCOUNT_TYPE, value: contract},
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient},
            { type: Constants.AMOUNT_TYPE, value: amount}
        ]
        return data
    }
}
