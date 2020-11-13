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

    createCreateAndLoadData(recipient, amount, unity, expiration_time) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        return [
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient },
            { type: Constants.AMOUNT_TYPE, value: amount },
            { type: Constants.TIME_STAMP_TYPE, value: expiration_time }
        ]
    }

    createExtendExpirationTimeData(channel_id, expiration_time) {
        return [
            { type: Constants.SHORT_BYTES_TYPE, value: channel_id },
            { type: Constants.TIME_STAMP_TYPE, value: expiration_time }
        ]
    }

    createLoadData(channel_id, amount, unity) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        return [
            { type: Constants.SHORT_BYTES_TYPE, value: channel_id },
            { type: Constants.AMOUNT_TYPE, value: amount }
        ]
    }

    createAbortData(channel_id) {
        return [{ type: Constants.SHORT_BYTES_TYPE, value: channel_id }]
    }

    createUnloadData(channel_id) {
        return [{ type: Constants.SHORT_BYTES_TYPE, value: channel_id }]
    }

    createCollectPaymentData(channel_id, amount, unity, signature) {
        amount = BigNumber(amount).multipliedBy(BigNumber(unity)).toString()
        return [
            { type: Constants.SHORT_BYTES_TYPE, value: channel_id },
            { type: Constants.AMOUNT_TYPE, value: amount},
            { type: Constants.SHORT_BYTES_TYPE, value: signature }
        ]
    }
}

export class LockContractDataGenerator {

    createInitData(token_id) {
        return [{ type: Constants.TOKEN_ID_TYPE, value: token_id }]
    }

    createLockData(timestamp) {
        return [{ type: Constants.TIME_STAMP_TYPE, value: timestamp }]
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

export class NonFungibleTokenContractDataGenerator {

    createInitData() {
        return []
    }

    createSupersedeData(issuer) {
        return [{ type: Constants.ACCOUNT_ADDR_TYPE, value: issuer }]
    }
}
