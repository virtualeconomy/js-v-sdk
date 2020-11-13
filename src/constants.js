"use strict";

export const MAINNET_BYTE = 'M'.charCodeAt(0);
export const TESTNET_BYTE = 'T'.charCodeAt(0);
export const ADDRESS_VERSION = 5;
export const PAYMENT_TX = 2;
export const LEASE_TX = 3;
export const CANCEL_LEASE_TX = 4;
export const REGISTER_CONTRACT_TX = 8;
export const EXECUTE_CONTRACT_TX = 9;
export const API_VERSION = 3;
export const PRIVATE_KEY_BYTE_LENGTH = 32;
export const PUBLIC_KEY_BYTE_LENGTH = 32;
export const PUBLIC_KEY_LENGTH = 44;
export const PRIVATE_KEY_LENGTH = 44;
export const ADDRESS_LENGTH = 35;
export const VSYS_PRECISION = 1e8;
export const TX_FEE = 0.1;
export const FEE_SCALE = 100;
export const CONTRACT_REGISTER_FEE = 100;
export const CONTRACT_EXEC_FEE = 0.3;
export const PROTOCOL = 'v.systems';
export const OPC_TRANSACTION = 'transaction';
export const OPC_CONTRACT = 'contract'
export const OPC_FUNCTION = 'function'
export const OPC_SIGNATURE = 'signature'
export const OPC_SEED = 'seed'
export const OPC_ACCOUNT = 'account'
export const AMOUNT_TYPE = 3;
export const CONTRACT_TYPE = 6;
export const SHORTTEXT_TYPE = 5;
export const INT32_TYPE = 4;
export const ACCOUNT_ADDR_TYPE = 2;
export const TOKEN_ID_TYPE = 8;
export const CONTRACT_ACCOUNT_TYPE = 6;
export const TIME_STAMP_TYPE = 9;
export const SHORT_BYTES_TYPE = 11;

// function index
export const SUPERSEDE_FUNCIDX = 0;
export const ISSUE_FUNCIDX = 1;
export const DESTROY_FUNCIDX = 2;
export const SPLIT_FUNCIDX = 3;
export const SEND_FUNCIDX = 3;
export const SEND_FUNCIDX_SPLIT = 4;
export const TRANSFER_FUNCIDX = 4;
export const TRANSFER_FUNCIDX_SPLIT = 5;
export const WITHDRAW_FUNCIDX = 6;
export const WITHDRAW_FUNCIDX_SPLIT = 7;
export const DEPOSIT_FUNCIDX = 5;
export const DEPOSIT_FUNCIDX_SPLIT = 6;

// system contract function index
export const SYSTEM_CONTRACT_SEND_FUNCIDX = 0;
export const SYSTEM_CONTRACT_DEPOSIT_FUNCIDX = 1;
export const SYSTEM_CONTRACT_WITHDRAW_FUNCIDX = 2;
export const SYSTEM_CONTRACT_TRANSFER_FUNCIDX = 3;

// payment channel contract function index
export const PAYMENTCHANNEL_CONTRACT_CREATEANDLOAD_FUNCIDX = 0;
export const PAYMENTCHANNEL_CONTRACT_EXTENDEXPIRATIONTIME_FUNCIDX = 1;
export const PAYMENTCHANNEL_CONTRACT_LOAD_FUNCIDX = 2;
export const PAYMENTCHANNEL_CONTRACT_ABORT_FUNCIDX = 3;
export const PAYMENTCHANNEL_CONTRACT_UNLOAD_FUNCIDX = 4;
export const PAYMENTCHANNEL_CONTRACT_COLLECTPAYMENT_FUNCIDX = 5;

// lock contract function index
export const LOCK_CONTRACT_LOCK_FUNCIDX = 0;

// nft contract function index
export const NFT_CONTRACT_SUPERSEDE_FUNCIDX = 0;
export const NFT_CONTRACT_ISSUE_FUNCIDX = 1;
export const NFT_CONTRACT_SEND_FUNCIDX = 2;
export const NFT_CONTRACT_TRANSFER_FUNCIDX = 3;
export const NFT_CONTRACT_DEPOSIT_FUNCIDX = 4;
export const NFT_CONTRACT_WITHDRAW_FUNCIDX = 5;

