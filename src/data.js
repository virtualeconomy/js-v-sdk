import BigNumber from "bignumber.js";
import * as Constants from "./constants";

export function getContractFunctionIndex(contract_type, function_type) {
    switch (contract_type) {
        case 'TOKEN':
            switch (function_type) {
                case 'SUPERSEDE':
                    return Constants.SUPERSEDE_FUNCIDX
                case 'ISSUE':
                    return Constants.ISSUE_FUNCIDX
                case 'DESTROY':
                    return Constants.DESTROY_FUNCIDX
                case 'SPLIT':
                    return Constants.SPLIT_FUNCIDX
                case 'SEND':
                    return Constants.SEND_FUNCIDX
                case 'SEND_SPLIT':
                    return Constants.SEND_FUNCIDX_SPLIT
                case 'TRANSFER':
                    return Constants.TRANSFER_FUNCIDX
                case 'TRANSFER_SPLIT':
                    return Constants.TRANSFER_FUNCIDX_SPLIT
                case 'WITHDRAW':
                    return Constants.WITHDRAW_FUNCIDX
                case 'WITHDRAW_SPLIT':
                    return Constants.WITHDRAW_FUNCIDX_SPLIT
                case 'DEPOSIT':
                    return Constants.DEPOSIT_FUNCIDX
                case 'DEPOSIT_SPLIT':
                    return Constants.DEPOSIT_FUNCIDX_SPLIT
                default:
                    throw new Error('Invalid function type!')
            }
        case 'SYSTEM':
            switch (function_type) {
                case 'SEND':
                    return Constants.SYSTEM_CONTRACT_SEND_FUNCIDX
                case 'TRANSFER':
                    return Constants.SYSTEM_CONTRACT_TRANSFER_FUNCIDX
                case 'WITHDRAW':
                    return Constants.SYSTEM_CONTRACT_WITHDRAW_FUNCIDX
                case 'DEPOSIT':
                    return Constants.SYSTEM_CONTRACT_DEPOSIT_FUNCIDX
                default:
                    throw new Error('Invalid function type!')
            }
        case 'LOCK':
            if (function_type === 'LOCK') {
                return Constants.LOCK_CONTRACT_LOCK_FUNCIDX
            } else throw new Error('Invalid function type!')
        case 'PAYMENT_CHANNEL':
            switch (function_type) {
                case 'CREATEANDLOAD':
                    return Constants.PAYMENTCHANNEL_CONTRACT_CREATEANDLOAD_FUNCIDX
                case 'EXTENDEXPIRATIONTIME':
                    return Constants.PAYMENTCHANNEL_CONTRACT_EXTENDEXPIRATIONTIME_FUNCIDX
                case 'LOAD':
                    return Constants.PAYMENTCHANNEL_CONTRACT_LOAD_FUNCIDX
                case 'ABORT':
                    return Constants.PAYMENTCHANNEL_CONTRACT_ABORT_FUNCIDX
                case 'UNLOAD':
                    return Constants.PAYMENTCHANNEL_CONTRACT_UNLOAD_FUNCIDX
                case 'COLLECTPAYMENT':
                    return Constants.PAYMENTCHANNEL_CONTRACT_COLLECTPAYMENT_FUNCIDX
                default:
                    throw new Error('Invalid function type!')
            }
        case 'NFT':
            switch (function_type) {
                case 'SUPERSEDE':
                    return Constants.NFT_CONTRACT_SUPERSEDE_FUNCIDX
                case 'ISSUE':
                    return Constants.NFT_CONTRACT_ISSUE_FUNCIDX
                case 'SEND':
                    return Constants.NFT_CONTRACT_SEND_FUNCIDX
                case 'TRANSFER':
                    return Constants.NFT_CONTRACT_TRANSFER_FUNCIDX
                case 'WITHDRAW':
                    return Constants.NFT_CONTRACT_WITHDRAW_FUNCIDX
                case 'DEPOSIT':
                    return Constants.NFT_CONTRACT_DEPOSIT_FUNCIDX
                default:
                    throw new Error('Invalid function type!')
            }
        default:
            throw new Error('Invalid contract type!')
    }
}


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

    createIssueData(tokenDescription) {
        let data = [
            { type: Constants.SHORTTEXT_TYPE, value: tokenDescription }
        ]
        return data
    }

    createSendData(recipient, tokenIndex) {
        let data = [
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient },
            { type: Constants.INT32_TYPE, value: tokenIndex }
        ]
        return data
    }

    createTransferData(sender, recipient, tokenIndex) {
        let data = [
            { type: Constants.ACCOUNT_ADDR_TYPE, value: sender },
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient },
            { type: Constants.INT32_TYPE, value: tokenIndex }
        ]
        return data
    }

    createDepositData(sender, contract, tokenIndex) {
        let data = [
            { type: Constants.ACCOUNT_ADDR_TYPE, value: sender },
            { type: Constants.CONTRACT_ACCOUNT_TYPE, value: contract },
            { type: Constants.INT32_TYPE, value: tokenIndex }
        ]
        return data
    }

    createWithdrawData(contract, recipient, tokenIndex) {
        let data = [
            { type: Constants.CONTRACT_ACCOUNT_TYPE, value: contract },
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient },
            { type: Constants.INT32_TYPE, value: tokenIndex }
        ]
        return data
    }
}
