import BigNumber from "bignumber.js";
import * as Constants from "./constants";
import * as ContractType from "./contract_type";

export function getContractFunctionIndex(contract_type, function_name) {
    if (!function_name) throw new Error('Invalid function name!')
    function_name = function_name.toUpperCase()
    switch (contract_type) {
        case ContractType.TOKEN:
            switch (function_name) {
                case 'SUPERSEDE':
                    return Constants.SUPERSEDE_FUNCIDX
                case 'ISSUE':
                    return Constants.ISSUE_FUNCIDX
                case 'DESTROY':
                    return Constants.DESTROY_FUNCIDX
                case 'SEND':
                    return Constants.SEND_FUNCIDX
                case 'TRANSFER':
                    return Constants.TRANSFER_FUNCIDX
                case 'WITHDRAW':
                    return Constants.WITHDRAW_FUNCIDX
                case 'DEPOSIT':
                    return Constants.DEPOSIT_FUNCIDX
                default:
                    throw new Error('Invalid function name!')
            }
        case ContractType.SPLITTABLE_TOKEN:
            switch (function_name) {
                case 'SUPERSEDE':
                    return Constants.SUPERSEDE_FUNCIDX
                case 'ISSUE':
                    return Constants.ISSUE_FUNCIDX
                case 'DESTROY':
                    return Constants.DESTROY_FUNCIDX
                case 'SPLIT':
                    return Constants.SPLIT_FUNCIDX
                case 'SEND':
                    return Constants.SEND_FUNCIDX_SPLIT
                case 'TRANSFER':
                    return Constants.TRANSFER_FUNCIDX_SPLIT
                case 'WITHDRAW':
                    return Constants.WITHDRAW_FUNCIDX_SPLIT
                case 'DEPOSIT':
                    return Constants.DEPOSIT_FUNCIDX_SPLIT
                default:
                    throw new Error('Invalid function name!')
            }
        case ContractType.SYSTEM:
            switch (function_name) {
                case 'SEND':
                    return Constants.SYSTEM_CONTRACT_SEND_FUNCIDX
                case 'TRANSFER':
                    return Constants.SYSTEM_CONTRACT_TRANSFER_FUNCIDX
                case 'WITHDRAW':
                    return Constants.SYSTEM_CONTRACT_WITHDRAW_FUNCIDX
                case 'DEPOSIT':
                    return Constants.SYSTEM_CONTRACT_DEPOSIT_FUNCIDX
                default:
                    throw new Error('Invalid function name!')
            }
        case ContractType.LOCK:
            if (function_name === 'LOCK') {
                return Constants.LOCK_CONTRACT_LOCK_FUNCIDX
            } else throw new Error('Invalid function name!')
        case ContractType.PAYMENT_CHANNEL:
            switch (function_name) {
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
                    throw new Error('Invalid function name!')
            }
        case ContractType.NFT:
            switch (function_name) {
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
                    throw new Error('Invalid function name!')
            }
        case ContractType.ATOMIC_SWAP:
            switch (function_name) {
                case 'LOCK':
                    return Constants.ATOMIC_SWAP_CONTRACT_LOCK_FUNCIDX
                case 'SOLVEPUZZLE':
                    return Constants.ATOMIC_SWAP_CONTRACT_SOLVE_PUZZLE_FUNCIDX
                case 'EXPIREWITHDRAW':
                    return Constants.ATOMIC_SWAP_CONTRACT_EXPIRE_WITHDRAW_FUNCIDX
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

export class AtomicSwapContractDataGenerator {

    createInitData(tokenIndex) {
        let data = [{ type: Constants.TOKEN_ID_TYPE, value: tokenIndex }]
        return data
    }

    createLockData(amount, recipient, puzzle, expiredTime) {
        let data = [
            { type: Constants.AMOUNT_TYPE, value: amount },
            { type: Constants.ACCOUNT_ADDR_TYPE, value: recipient },
            { type: Constants.SHORT_BYTES_TYPE, value: puzzle },
            { type: Constants.TIME_STAMP_TYPE, value: expiredTime }
        ]
        return data
    }

    createSolvePuzzleData(txIndex, key) {
        let data = [
            { type: Constants.SHORT_BYTES_TYPE, value: txIndex },
            { type: Constants.SHORT_BYTES_TYPE, value: key }
        ]
        return data
    }

    createExpireWithdrawData(txIndex) {
        let data = [{ type: Constants.SHORT_BYTES_TYPE, value: txIndex }]
        return data
    }
}
