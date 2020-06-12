import BigNumber from "bignumber.js";
import * as Constants from "./constants";

export class TokenContractDataGenerator {

    createInitData(amount, unity, des) {
        let max = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.AMOUNT_TYPE, value: max },
            { type: Constants.AMOUNT_TYPE, value: BigNumber(unity).toString() },
            { type: Constants.SHORTTEXT_TYPE, value: des }
        ]
        return data
    }

    createIssueData(amount, unity) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.AMOUNT_TYPE, value: amount }
        ]
        return data
    }

    createDestroyData(amount, unity) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.AMOUNT_TYPE, value: amount }
        ]
        return data
    }

    createSplitData(unity) {
        return [{ type: Constants.AMOUNT_TYPE, value: BigNumber(unity).toString() }]
    }

    createSupersedeData(issuer) {
        return [{ type: Constants.ACCOUNT_ADDR_TYPE, value: issuer }]
    }

    createSendData(recipient, amount, unity) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient },
            { type: Constants.AMOUNT_TYPE, value: amount }
        ]
        return data
    }

    createTransferData(sender, recipient, amount, unity) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.ACCOUNT_ADDR_TYPE, value: sender },
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient },
            { type: Constants.AMOUNT_TYPE, value: amount }
        ]
        return data
    }

    createDepositData(sender, contract, amount, unity) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.ACCOUNT_ADDR_TYPE, value: sender },
            { type: Constants.CONTRACT_ACCOUNT_TYPE, value: contract },
            { type: Constants.AMOUNT_TYPE, value: amount }
        ]
        return data
    }

    createWithdrawData(contract, recipient, amount, unity) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        let data = [
            { type: Constants.CONTRACT_ACCOUNT_TYPE, value: contract },
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient },
            { type: Constants.AMOUNT_TYPE, value: amount }
        ]
        return data
    }
}

export class PaymentChannelContractDataGenerator {
    createInitData(token_id) {
        return [{ type: Constants.TOKEN_ID_TYPE, value: token_id }]
    }
}

export class LockContractDataGenerator {
    createInitData(token_id) {
        return [{ type: Constants.TOKEN_ID_TYPE, value: token_id }]
    }
}

export class SystemContractDataGenerator {
    createSendData(recipient, amount) {
        amount = BigNumber(amount).multipliedBy(1e8).toString()
        let data = [
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient },
            { type: Constants.AMOUNT_TYPE, value: amount }
        ]
        return data
    }

    createTransferData(sender, recipient, amount) {
        amount = BigNumber(amount).multipliedBy(1e8).toString()
        let data = [
            { type: Constants.ACCOUNT_ADDR_TYPE, value: sender },
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient },
            { type: Constants.AMOUNT_TYPE, value: amount }
        ]
        return data
    }

    createDepositData(sender, contract, amount) {
        amount = BigNumber(amount).multipliedBy(1e8).toString()
        let data = [
            { type: Constants.ACCOUNT_ADDR_TYPE, value: sender },
            { type: Constants.CONTRACT_ACCOUNT_TYPE, value: contract },
            { type: Constants.AMOUNT_TYPE, value: amount }
        ]
        return data
    }

    createWithdrawData(contract, recipient, amount) {
        amount = BigNumber(amount).multipliedBy(1e8).toString()
        let data = [
            { type: Constants.CONTRACT_ACCOUNT_TYPE, value: contract },
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient },
            { type: Constants.AMOUNT_TYPE, value: amount }
        ]
        return data
    }
}
