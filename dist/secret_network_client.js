"use strict";
// import fetch from "cross-fetch";
// global.fetch = fetch;
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TxResultCode = exports.gasToFee = exports.SecretNetworkClient = exports.ReadonlySigner = exports.BroadcastMode = void 0;
const encoding_1 = require("@cosmjs/encoding");
const sha256_1 = require("@noble/hashes/sha256");
const _1 = require(".");
const encryption_1 = require("./encryption");
const permit_signer_1 = require("./extensions/access_control/permit/permit_signer");
const msgs_1 = require("./extensions/access_control/viewing_key/msgs");
const query_1 = require("./extensions/snip1155/query");
const tx_1 = require("./extensions/snip1155/tx");
const snip20_1 = require("./extensions/snip20");
const snip721_1 = require("./extensions/snip721");
const service_pb_1 = require("./grpc_gateway/cosmos/tx/v1beta1/service.pb");
const abci_1 = require("./protobuf/cosmos/base/abci/v1beta1/abci");
const keys_1 = require("./protobuf/cosmos/crypto/multisig/keys");
const keys_2 = require("./protobuf/cosmos/crypto/secp256k1/keys");
const tx_2 = require("./protobuf/cosmos/tx/v1beta1/tx");
const any_1 = require("./protobuf/google/protobuf/any");
const msg_1 = require("./protobuf/secret/compute/v1beta1/msg");
const auth_1 = require("./query/auth");
const authz_1 = require("./query/authz");
const bank_1 = require("./query/bank");
const compute_1 = require("./query/compute");
const distribution_1 = require("./query/distribution");
const evidence_1 = require("./query/evidence");
const feegrant_1 = require("./query/feegrant");
const gov_1 = require("./query/gov");
const ibc_channel_1 = require("./query/ibc_channel");
const ibc_client_1 = require("./query/ibc_client");
const ibc_connection_1 = require("./query/ibc_connection");
const ibc_transfer_1 = require("./query/ibc_transfer");
const mint_1 = require("./query/mint");
const params_1 = require("./query/params");
const registration_1 = require("./query/registration");
const slashing_1 = require("./query/slashing");
const staking_1 = require("./query/staking");
const tendermint_1 = require("./query/tendermint");
const upgrade_1 = require("./query/upgrade");
const tx_3 = require("./tx");
const registration_2 = require("./tx/registration");
const vesting_1 = require("./tx/vesting");
const wallet_amino_1 = require("./wallet_amino");
const ibc_interchain_accounts_host_1 = require("./query/ibc_interchain_accounts_host");
const ibc_interchain_accounts_controller_1 = require("./query/ibc_interchain_accounts_controller");
var BroadcastMode;
(function (BroadcastMode) {
    /**
     * Broadcast transaction to mempool and wait for DeliverTx response.
     *
     * @see https://docs.tendermint.com/master/rpc/#/Tx/broadcast_tx_commit
     */
    BroadcastMode["Block"] = "Block";
    /**
     * Broadcast transaction to mempool and wait for CheckTx response.
     *
     * @see https://docs.tendermint.com/master/rpc/#/Tx/broadcast_tx_sync
     */
    BroadcastMode["Sync"] = "Sync";
    /**
     * Broadcast transaction to mempool and do not wait for CheckTx response.
     *
     * @see https://docs.tendermint.com/master/rpc/#/Tx/broadcast_tx_async
     */
    BroadcastMode["Async"] = "Async";
})(BroadcastMode = exports.BroadcastMode || (exports.BroadcastMode = {}));
class ReadonlySigner {
    getAccounts() {
        throw new Error("getAccounts() is not supported in readonly mode.");
    }
    signAmino(_signerAddress, _signDoc) {
        throw new Error("signAmino() is not supported in readonly mode.");
    }
}
exports.ReadonlySigner = ReadonlySigner;
class SecretNetworkClient {
    /** Creates a new SecretNetworkClient client. For a readonly client pass just the `url` param. */
    constructor(options) {
        var _a, _b;
        this.url = options.url.replace(/\/*$/g, ""); // remove trailing slashes
        this.query = {
            auth: new auth_1.AuthQuerier(options.url),
            authz: new authz_1.AuthzQuerier(options.url),
            bank: new bank_1.BankQuerier(options.url),
            compute: new compute_1.ComputeQuerier(options.url),
            snip20: new snip20_1.Snip20Querier(options.url),
            snip721: new snip721_1.Snip721Querier(options.url),
            snip1155: new query_1.Snip1155Querier(options.url),
            distribution: new distribution_1.DistributionQuerier(options.url),
            evidence: new evidence_1.EvidenceQuerier(options.url),
            feegrant: new feegrant_1.FeegrantQuerier(options.url),
            gov: new gov_1.GovQuerier(options.url),
            ibc_channel: new ibc_channel_1.IbcChannelQuerier(options.url),
            ibc_client: new ibc_client_1.IbcClientQuerier(options.url),
            ibc_connection: new ibc_connection_1.IbcConnectionQuerier(options.url),
            ibc_transfer: new ibc_transfer_1.IbcTransferQuerier(options.url),
            ibc_iterchain_accounts_host: new ibc_interchain_accounts_host_1.IbcInterchainAccountsHostQuerier(options.url),
            ibc_iterchain_accounts_controller: new ibc_interchain_accounts_controller_1.IbcInterchainAccountsControllerQuerier(options.url),
            mauth: new _1.MauthQuerier(options.url),
            mint: new mint_1.MintQuerier(options.url),
            node: new _1.NodeQuerier(options.url),
            params: new params_1.ParamsQuerier(options.url),
            registration: new registration_1.RegistrationQuerier(options.url),
            slashing: new slashing_1.SlashingQuerier(options.url),
            staking: new staking_1.StakingQuerier(options.url),
            tendermint: new tendermint_1.TendermintQuerier(options.url),
            upgrade: new upgrade_1.UpgradeQuerier(options.url),
            getTx: (hash, ibcTxOptions) => this.getTx(hash, ibcTxOptions),
            txsQuery: (query, ibcTxOptions, pagination, order_by) => this.txsQuery(query, ibcTxOptions, pagination, order_by),
        };
        if (options.wallet && options.walletAddress === undefined) {
            throw new Error("Must also pass 'walletAddress' when passing 'wallet'");
        }
        this.wallet = (_a = options.wallet) !== null && _a !== void 0 ? _a : new ReadonlySigner();
        this.address = (_b = options.walletAddress) !== null && _b !== void 0 ? _b : "";
        this.chainId = options.chainId;
        this.utils = { accessControl: { permit: new permit_signer_1.PermitSigner(this.wallet) } };
        // TODO fix this "any"
        const doMsg = (msgClass) => {
            const func = (params, options) => {
                return this.tx.broadcast([new msgClass(params)], options);
            };
            func.simulate = (params, options) => {
                return this.tx.simulate([new msgClass(params)], options);
            };
            return func;
        };
        this.tx = {
            signTx: this.signTx.bind(this),
            broadcastSignedTx: this.broadcastSignedTx.bind(this),
            broadcast: this.signAndBroadcast.bind(this),
            simulate: this.simulate.bind(this),
            snip20: {
                send: doMsg(snip20_1.MsgSnip20Send),
                transfer: doMsg(snip20_1.MsgSnip20Transfer),
                increaseAllowance: doMsg(snip20_1.MsgSnip20IncreaseAllowance),
                decreaseAllowance: doMsg(snip20_1.MsgSnip20DecreaseAllowance),
                setViewingKey: doMsg(msgs_1.MsgSetViewingKey),
                createViewingKey: doMsg(msgs_1.MsgCreateViewingKey),
            },
            snip721: {
                send: doMsg(snip721_1.MsgSnip721Send),
                mint: doMsg(_1.MsgSnip721Mint),
                addMinter: doMsg(_1.MsgSnip721AddMinter),
                setViewingKey: doMsg(msgs_1.MsgSetViewingKey),
                createViewingKey: doMsg(msgs_1.MsgCreateViewingKey),
            },
            snip1155: {
                changeAdmin: doMsg(tx_1.MsgSnip1155ChangeAdmin),
                removeAdmin: doMsg(tx_1.MsgSnip1155RemoveAdmin),
                addCurator: doMsg(tx_1.MsgSnip1155AddCurator),
                removeCurator: doMsg(tx_1.MsgSnip1155RemoveCurator),
                addMinter: doMsg(tx_1.MsgSnipAddMinter),
                removeMinter: doMsg(tx_1.MsgSnip1155RemoveMinter),
                send: doMsg(tx_1.MsgSnip1155Send),
                batchSend: doMsg(tx_1.MsgSnip1155BatchSend),
                transfer: doMsg(tx_1.MsgSnip1155Transfer),
                batchTransfer: doMsg(tx_1.MsgSnip1155BatchTransfer),
                curate: doMsg(tx_1.MsgSnip1155CurateTokens),
                mint: doMsg(tx_1.MsgSnip1155Mint),
                burn: doMsg(tx_1.MsgSnip1155Burn),
                changeMetaData: doMsg(tx_1.MsgSnip1155ChangeMetadata),
                setViewingKey: doMsg(msgs_1.MsgSetViewingKey),
                createViewingKey: doMsg(msgs_1.MsgCreateViewingKey),
            },
            authz: {
                exec: doMsg(_1.MsgExec),
                grant: doMsg(_1.MsgGrant),
                revoke: doMsg(_1.MsgRevoke),
            },
            bank: {
                multiSend: doMsg(_1.MsgMultiSend),
                send: doMsg(_1.MsgSend),
            },
            compute: {
                executeContract: doMsg(_1.MsgExecuteContract),
                instantiateContract: doMsg(_1.MsgInstantiateContract),
                storeCode: doMsg(_1.MsgStoreCode),
            },
            crisis: {
                verifyInvariant: doMsg(_1.MsgVerifyInvariant),
            },
            distribution: {
                fundCommunityPool: doMsg(_1.MsgFundCommunityPool),
                setWithdrawAddress: doMsg(_1.MsgSetWithdrawAddress),
                withdrawDelegatorReward: doMsg(_1.MsgWithdrawDelegatorReward),
                withdrawValidatorCommission: doMsg(_1.MsgWithdrawValidatorCommission),
                setAutoRestake: doMsg(tx_3.MsgSetAutoRestake),
            },
            evidence: {
                submitEvidence: doMsg(_1.MsgSubmitEvidence),
            },
            feegrant: {
                grantAllowance: doMsg(_1.MsgGrantAllowance),
                revokeAllowance: doMsg(_1.MsgRevokeAllowance),
            },
            gov: {
                deposit: doMsg(_1.MsgDeposit),
                submitProposal: doMsg(_1.MsgSubmitProposal),
                vote: doMsg(_1.MsgVote),
                voteWeighted: doMsg(_1.MsgVoteWeighted),
            },
            ibc: {
                transfer: doMsg(_1.MsgTransfer),
            },
            registration: {
                register: doMsg(registration_2.RaAuthenticate),
            },
            slashing: {
                unjail: doMsg(_1.MsgUnjail),
            },
            staking: {
                beginRedelegate: doMsg(_1.MsgBeginRedelegate),
                createValidator: doMsg(_1.MsgCreateValidator),
                delegate: doMsg(_1.MsgDelegate),
                editValidator: doMsg(_1.MsgEditValidator),
                undelegate: doMsg(_1.MsgUndelegate),
            },
            vesting: {
                createVestingAccount: doMsg(vesting_1.MsgCreateVestingAccount),
            },
        };
        if (options.encryptionUtils) {
            this.encryptionUtils = options.encryptionUtils;
        }
        else {
            this.encryptionUtils = new encryption_1.EncryptionUtilsImpl(this.url, options.encryptionSeed, this.chainId);
        }
        // Reinitialize ComputeQuerier with a shared EncryptionUtils (better caching, same seed)
        this.query.compute = new compute_1.ComputeQuerier(this.url, this.encryptionUtils);
    }
    getTx(hash, ibcTxOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tx_response } = yield service_pb_1.Service.GetTx({ hash }, { pathPrefix: this.url });
                return tx_response
                    ? this.decodeTxResponse(tx_response, ibcTxOptions)
                    : null;
            }
            catch (error) {
                if ((error === null || error === void 0 ? void 0 : error.message) === `tx not found: ${hash}`) {
                    return null;
                }
                else {
                    throw error;
                }
            }
        });
    }
    txsQuery(query, ibcTxOptions = {
        resolveResponses: false,
    }, pagination = {
        key: undefined,
        offset: undefined,
        limit: undefined,
        count_total: undefined,
        reverse: undefined,
    }, order_by) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tx_responses } = yield service_pb_1.Service.GetTxsEvent({
                events: query.split(" AND ").map((q) => q.trim()),
                pagination,
                order_by,
            }, { pathPrefix: this.url });
            return this.decodeTxResponses(tx_responses !== null && tx_responses !== void 0 ? tx_responses : [], ibcTxOptions);
        });
    }
    waitForIbcResponse(packetSequence, packetSrcChannel, type, ibcTxOptions, isDoneObject) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let tries = ibcTxOptions.resolveResponsesTimeoutMs /
                    ibcTxOptions.resolveResponsesCheckIntervalMs;
                let txType = type;
                if (type === "ack") {
                    txType = "acknowledge";
                }
                const query = [
                    `${txType}_packet.packet_src_channel = '${packetSrcChannel}'`,
                    `${txType}_packet.packet_sequence = '${packetSequence}'`,
                ].join(" AND ");
                while (tries > 0 && !isDoneObject.isDone) {
                    const txs = yield this.txsQuery(query);
                    const ibcRespTx = txs.find((tx) => tx.code === 0);
                    if (ibcRespTx) {
                        isDoneObject.isDone = true;
                        resolve({
                            type,
                            tx: ibcRespTx,
                        });
                    }
                    tries--;
                    yield sleep(ibcTxOptions.resolveResponsesCheckIntervalMs);
                }
                reject(`timed-out while trying to resolve IBC ${type} tx for packet_src_channel='${packetSrcChannel}' and packet_sequence='${packetSequence}'`);
            }));
        });
    }
    decodeTxResponses(txResponses, ibcTxOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(txResponses.map((x) => this.decodeTxResponse(x, ibcTxOptions)));
        });
    }
    decodeTxResponse(txResp, ibcTxOptions) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            let explicitIbcTxOptions;
            if (!ibcTxOptions) {
                explicitIbcTxOptions = {
                    resolveResponses: true,
                    resolveResponsesTimeoutMs: 120000,
                    resolveResponsesCheckIntervalMs: 15000,
                };
            }
            else {
                explicitIbcTxOptions = {
                    resolveResponses: typeof ibcTxOptions.resolveResponses === "boolean"
                        ? ibcTxOptions.resolveResponses
                        : true,
                    resolveResponsesTimeoutMs: typeof ibcTxOptions.resolveResponsesTimeoutMs === "number"
                        ? ibcTxOptions.resolveResponsesTimeoutMs
                        : 120000,
                    resolveResponsesCheckIntervalMs: typeof ibcTxOptions.resolveResponsesCheckIntervalMs === "number"
                        ? ibcTxOptions.resolveResponsesCheckIntervalMs
                        : 15000,
                };
            }
            const nonces = [];
            const tx = txResp.tx;
            // Decoded input tx messages
            for (let i = 0; !isNaN(Number((_b = (_a = tx === null || tx === void 0 ? void 0 : tx.body) === null || _a === void 0 ? void 0 : _a.messages) === null || _b === void 0 ? void 0 : _b.length)) &&
                i < Number((_d = (_c = tx === null || tx === void 0 ? void 0 : tx.body) === null || _c === void 0 ? void 0 : _c.messages) === null || _d === void 0 ? void 0 : _d.length); i++) {
                const msg = tx.body.messages[i];
                // Check if the message needs decryption
                let contractInputMsgFieldName = "";
                if (msg["@type"] === "/secret.compute.v1beta1.MsgInstantiateContract") {
                    contractInputMsgFieldName = "init_msg";
                }
                else if (msg["@type"] === "/secret.compute.v1beta1.MsgExecuteContract") {
                    contractInputMsgFieldName = "msg";
                }
                if (contractInputMsgFieldName !== "") {
                    // Encrypted, try to decrypt
                    try {
                        const contractInputMsgBytes = (0, encoding_1.fromBase64)(msg[contractInputMsgFieldName]);
                        const nonce = contractInputMsgBytes.slice(0, 32);
                        const ciphertext = contractInputMsgBytes.slice(64);
                        const plaintext = yield this.encryptionUtils.decrypt(ciphertext, nonce);
                        msg[contractInputMsgFieldName] = JSON.parse((0, encoding_1.fromUtf8)(plaintext).slice(64));
                        nonces[i] = nonce; // Fill nonces array to later use it in output decryption
                    }
                    catch (decryptionError) {
                        // Not encrypted or can't decrypt because not original sender
                    }
                }
                tx.body.messages[i] = msg;
            }
            let rawLog = txResp.raw_log;
            let jsonLog;
            let arrayLog;
            let ibcResponses = [];
            if (txResp.code === 0 && rawLog !== "") {
                jsonLog = JSON.parse(rawLog);
                arrayLog = [];
                for (let msgIndex = 0; msgIndex < jsonLog.length; msgIndex++) {
                    if (jsonLog[msgIndex].msg_index === undefined) {
                        jsonLog[msgIndex].msg_index = msgIndex;
                        // See https://github.com/cosmos/cosmos-sdk/pull/11147
                    }
                    const log = jsonLog[msgIndex];
                    for (const event of log.events) {
                        for (const attr of event.attributes) {
                            // Try to decrypt
                            if (event.type === "wasm") {
                                const nonce = nonces[msgIndex];
                                if (nonce && nonce.length === 32) {
                                    try {
                                        attr.key = (0, encoding_1.fromUtf8)(yield this.encryptionUtils.decrypt((0, encoding_1.fromBase64)(attr.key), nonce)).trim();
                                    }
                                    catch (e) { }
                                    try {
                                        attr.value = (0, encoding_1.fromUtf8)(yield this.encryptionUtils.decrypt((0, encoding_1.fromBase64)(attr.value), nonce)).trim();
                                    }
                                    catch (e) { }
                                }
                            }
                            arrayLog.push({
                                msg: msgIndex,
                                type: event.type,
                                key: attr.key,
                                value: attr.value,
                            });
                        }
                    }
                }
            }
            else if (txResp.code !== 0 && rawLog !== "") {
                try {
                    const errorMessageRgx = /; message index: (\d+):(?: dispatch: submessages:)* encrypted: (.+?): (?:instantiate|execute|query|reply to) contract failed/g;
                    const rgxMatches = errorMessageRgx.exec(rawLog);
                    if ((rgxMatches === null || rgxMatches === void 0 ? void 0 : rgxMatches.length) === 3) {
                        const encryptedError = (0, encoding_1.fromBase64)(rgxMatches[2]);
                        const msgIndex = Number(rgxMatches[1]);
                        const decryptedBase64Error = yield this.encryptionUtils.decrypt(encryptedError, nonces[msgIndex]);
                        const decryptedError = (0, encoding_1.fromUtf8)(decryptedBase64Error);
                        rawLog = rawLog.replace(`encrypted: ${rgxMatches[2]}`, decryptedError);
                        try {
                            jsonLog = JSON.parse(decryptedError);
                        }
                        catch (e) { }
                    }
                }
                catch (decryptionError) {
                    // Not encrypted or can't decrypt because not original sender
                }
            }
            const txMsgData = abci_1.TxMsgData.decode((0, encoding_1.fromHex)(txResp.data));
            const data = new Array(txMsgData.data.length);
            for (let msgIndex = 0; msgIndex < txMsgData.data.length; msgIndex++) {
                data[msgIndex] = txMsgData.data[msgIndex].data;
                const nonce = nonces[msgIndex];
                if (nonce && nonce.length === 32) {
                    // Check if the output data needs decryption
                    try {
                        const { "@type": type_url } = tx.body.messages[msgIndex];
                        if (type_url === "/secret.compute.v1beta1.MsgInstantiateContract") {
                            const decoded = msg_1.MsgInstantiateContractResponse.decode(txMsgData.data[msgIndex].data);
                            const decrypted = (0, encoding_1.fromBase64)((0, encoding_1.fromUtf8)(yield this.encryptionUtils.decrypt(decoded.data, nonce)));
                            data[msgIndex] = msg_1.MsgInstantiateContractResponse.encode({
                                address: decoded.address,
                                data: decrypted,
                            }).finish();
                        }
                        else if (type_url === "/secret.compute.v1beta1.MsgExecuteContract") {
                            const decoded = msg_1.MsgExecuteContractResponse.decode(txMsgData.data[msgIndex].data);
                            const decrypted = (0, encoding_1.fromBase64)((0, encoding_1.fromUtf8)(yield this.encryptionUtils.decrypt(decoded.data, nonce)));
                            data[msgIndex] = msg_1.MsgExecuteContractResponse.encode({
                                data: decrypted,
                            }).finish();
                        }
                    }
                    catch (decryptionError) {
                        // Not encrypted or can't decrypt because not original sender
                    }
                }
            }
            // IBC ACKs:
            if (txResp.code === TxResultCode.Success) {
                const packetSequences = (arrayLog === null || arrayLog === void 0 ? void 0 : arrayLog.filter((x) => x.type === "send_packet" && x.key === "packet_sequence")) || [];
                const packetSrcChannels = (arrayLog === null || arrayLog === void 0 ? void 0 : arrayLog.filter((x) => x.type === "send_packet" && x.key === "packet_src_channel")) || [];
                if (explicitIbcTxOptions.resolveResponses) {
                    for (let msgIndex = 0; msgIndex < (packetSequences === null || packetSequences === void 0 ? void 0 : packetSequences.length); msgIndex++) {
                        // isDoneObject is used to cancel the second promise if the first one is resolved
                        const isDoneObject = {
                            isDone: false,
                        };
                        ibcResponses.push(Promise.race([
                            this.waitForIbcResponse(packetSequences[msgIndex].value, packetSrcChannels[msgIndex].value, "ack", explicitIbcTxOptions, isDoneObject),
                            this.waitForIbcResponse(packetSequences[msgIndex].value, packetSrcChannels[msgIndex].value, "timeout", explicitIbcTxOptions, isDoneObject),
                        ]));
                    }
                }
            }
            return {
                height: Number(txResp.height),
                timestamp: txResp.timestamp,
                transactionHash: txResp.txhash,
                code: txResp.code,
                codespace: txResp.codespace,
                info: txResp.info,
                tx,
                rawLog,
                jsonLog,
                arrayLog,
                events: txResp.events,
                data,
                gasUsed: Number(txResp.gas_used),
                gasWanted: Number(txResp.gas_wanted),
                ibcResponses,
            };
        });
    }
    /**
     * Broadcasts a signed transaction to the network and monitors its inclusion in a block.
     *
     * If broadcasting is rejected by the node for some reason (e.g. because of a CheckTx failure),
     * an error is thrown.
     *
     * If the transaction is not included in a block before the provided timeout, this errors with a `TimeoutError`.
     *
     * If the transaction is included in a block, a {@link TxResponse} is returned. The caller then
     * usually needs to check for execution success or failure.
     */
    broadcastTx(txBytes, timeoutMs, checkIntervalMs, mode, waitForCommit, ibcTxOptions) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const start = Date.now();
            const txhash = (0, encoding_1.toHex)((0, sha256_1.sha256)(txBytes)).toUpperCase();
            if (!waitForCommit && mode == BroadcastMode.Block) {
                mode = BroadcastMode.Sync;
            }
            let tx_response;
            if (mode === BroadcastMode.Block) {
                waitForCommit = true;
                const { BroadcastMode } = yield Promise.resolve().then(() => __importStar(require("./grpc_gateway/cosmos/tx/v1beta1/service.pb")));
                let isBroadcastTimedOut = false;
                try {
                    ({ tx_response } = yield service_pb_1.Service.BroadcastTx({
                        //@ts-ignore for some reason the type is tx_bytes but only works as txBytes
                        txBytes: (0, encoding_1.toBase64)(txBytes),
                        mode: BroadcastMode.BROADCAST_MODE_BLOCK,
                    }, { pathPrefix: this.url }));
                }
                catch (e) {
                    if (JSON.stringify(e)
                        .toLowerCase()
                        .includes("timed out waiting for tx to be included in a block")) {
                        isBroadcastTimedOut = true;
                    }
                    else {
                        throw new Error(`Failed to broadcast transaction ID ${txhash}: '${JSON.stringify(e)}'.`);
                    }
                }
                if (!isBroadcastTimedOut) {
                    tx_response.tx = (yield Promise.resolve().then(() => __importStar(require("./protobuf/cosmos/tx/v1beta1/tx")))).Tx.toJSON((yield Promise.resolve().then(() => __importStar(require("./protobuf/cosmos/tx/v1beta1/tx")))).Tx.decode(txBytes));
                    const tx = tx_response.tx;
                    const resolvePubkey = (pubkey) => {
                        if (pubkey.type_url === "/cosmos.crypto.multisig.LegacyAminoPubKey") {
                            const multisig = keys_1.LegacyAminoPubKey.decode(
                            // @ts-expect-error
                            (0, encoding_1.fromBase64)(pubkey.value));
                            for (let i = 0; i < multisig.public_keys.length; i++) {
                                // @ts-expect-error
                                multisig.public_keys[i] = resolvePubkey(multisig.public_keys[i]);
                            }
                            return keys_1.LegacyAminoPubKey.toJSON(multisig);
                        }
                        else {
                            return {
                                type_url: pubkey.type_url,
                                // assuming all single pubkeys have the same protobuf type
                                // this works for secp256k1, secp256r1 & ethermint pubkeys
                                value: keys_2.PubKey.toJSON(keys_2.PubKey.decode(
                                // @ts-expect-error
                                // pubkey.value is actually a base64 string but it's Any
                                // so TypeScript thinks it's a Uint8Array
                                (0, encoding_1.fromBase64)(pubkey.value))),
                            };
                        }
                    };
                    //@ts-ignore
                    tx.auth_info.signer_infos = (_b = (_a = tx.auth_info) === null || _a === void 0 ? void 0 : _a.signer_infos) === null || _b === void 0 ? void 0 : _b.map((si) => {
                        //@ts-ignore
                        si.public_key = resolvePubkey(si.public_key);
                        return si;
                    });
                    for (let i = 0; !isNaN(Number((_d = (_c = tx.body) === null || _c === void 0 ? void 0 : _c.messages) === null || _d === void 0 ? void 0 : _d.length)) &&
                        i < Number((_f = (_e = tx.body) === null || _e === void 0 ? void 0 : _e.messages) === null || _f === void 0 ? void 0 : _f.length); i++) {
                        //@ts-ignore
                        let msg = tx.body.messages[i];
                        const { type_url: msgType, value: msgBytes } = msg;
                        const msgDecoder = tx_3.MsgRegistry.get(msgType);
                        if (!msgDecoder) {
                            continue;
                        }
                        msg = {
                            type_url: msgType,
                            value: msgDecoder.decode((0, encoding_1.fromBase64)(msgBytes)),
                        };
                        if (msg.type_url === "/secret.compute.v1beta1.MsgInstantiateContract") {
                            msg.value.sender = (0, compute_1.bytesToAddress)(msg.value.sender);
                            msg.value.init_msg = (0, encoding_1.toBase64)(msg.value.init_msg);
                            msg.value.callback_sig = null;
                        }
                        else if (msg.type_url === "/secret.compute.v1beta1.MsgExecuteContract") {
                            msg.value.sender = (0, compute_1.bytesToAddress)(msg.value.sender);
                            msg.value.contract = (0, compute_1.bytesToAddress)(msg.value.contract);
                            msg.value.msg = (0, encoding_1.toBase64)(msg.value.msg);
                            msg.value.callback_sig = null;
                        }
                        else if (msg.type_url === "/secret.compute.v1beta1.MsgStoreCode") {
                            msg.value.sender = (0, compute_1.bytesToAddress)(msg.value.sender);
                            msg.value.wasm_byte_code = (0, encoding_1.toBase64)(msg.value.wasm_byte_code);
                        }
                        tx.body.messages[i] = msg;
                    }
                    tx_response.tx = Object.assign({ "@type": "/cosmos.tx.v1beta1.Tx" }, protobufJsonToGrpcGatewayJson(tx_response.tx));
                    return yield this.decodeTxResponse(tx_response, ibcTxOptions);
                }
            }
            else if (mode === BroadcastMode.Sync) {
                const { BroadcastMode } = yield Promise.resolve().then(() => __importStar(require("./grpc_gateway/cosmos/tx/v1beta1/service.pb")));
                ({ tx_response } = yield service_pb_1.Service.BroadcastTx({
                    //@ts-ignore for some reason the type is tx_bytes but only works as txBytes
                    txBytes: (0, encoding_1.toBase64)(txBytes),
                    mode: BroadcastMode.BROADCAST_MODE_SYNC,
                }, { pathPrefix: this.url }));
                if ((tx_response === null || tx_response === void 0 ? void 0 : tx_response.code) !== 0) {
                    throw new Error(`Broadcasting transaction failed with code ${tx_response === null || tx_response === void 0 ? void 0 : tx_response.code} (codespace: ${tx_response === null || tx_response === void 0 ? void 0 : tx_response.codespace}). Log: ${tx_response === null || tx_response === void 0 ? void 0 : tx_response.raw_log}`);
                }
            }
            else if (mode === BroadcastMode.Async) {
                const { BroadcastMode } = yield Promise.resolve().then(() => __importStar(require("./grpc_gateway/cosmos/tx/v1beta1/service.pb")));
                service_pb_1.Service.BroadcastTx({
                    //@ts-ignore for some reason the type is tx_bytes but only works as txBytes
                    txBytes: (0, encoding_1.toBase64)(txBytes),
                    mode: BroadcastMode.BROADCAST_MODE_ASYNC,
                }, { pathPrefix: this.url });
            }
            else {
                throw new Error(`Unknown broadcast mode "${String(mode)}", must be either "${String(BroadcastMode.Block)}", "${String(BroadcastMode.Sync)}" or "${String(BroadcastMode.Async)}".`);
            }
            if (!waitForCommit) {
                //@ts-ignore
                return { transactionHash: txhash };
            }
            // sleep first because there's no point in checking right after broadcasting
            yield sleep(checkIntervalMs / 2);
            while (true) {
                const result = yield this.getTx(txhash, ibcTxOptions);
                if (result) {
                    return result;
                }
                if (start + timeoutMs < Date.now()) {
                    throw new Error(`Transaction ID ${txhash} was submitted but was not yet found on the chain. You might want to check later or increase broadcastTimeoutMs from '${timeoutMs}'.`);
                }
                yield sleep(checkIntervalMs);
            }
        });
    }
    signTx(messages, txOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            let signed = yield this.prepareAndSign(messages, txOptions);
            return (0, encoding_1.toBase64)(signed);
        });
    }
    broadcastSignedTx(messages, txOptions) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            let txBytes = (0, encoding_1.fromBase64)(messages);
            return this.broadcastTx(txBytes, (_a = txOptions === null || txOptions === void 0 ? void 0 : txOptions.broadcastTimeoutMs) !== null && _a !== void 0 ? _a : 60000, (_b = txOptions === null || txOptions === void 0 ? void 0 : txOptions.broadcastCheckIntervalMs) !== null && _b !== void 0 ? _b : 6000, (_c = txOptions === null || txOptions === void 0 ? void 0 : txOptions.broadcastMode) !== null && _c !== void 0 ? _c : BroadcastMode.Block, (_d = txOptions === null || txOptions === void 0 ? void 0 : txOptions.waitForCommit) !== null && _d !== void 0 ? _d : true);
        });
    }
    prepareAndSign(messages, txOptions, simulate = false) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const gasLimit = (_a = txOptions === null || txOptions === void 0 ? void 0 : txOptions.gasLimit) !== null && _a !== void 0 ? _a : 25000;
            const gasPriceInFeeDenom = (_b = txOptions === null || txOptions === void 0 ? void 0 : txOptions.gasPriceInFeeDenom) !== null && _b !== void 0 ? _b : 0.1;
            const feeDenom = (_c = txOptions === null || txOptions === void 0 ? void 0 : txOptions.feeDenom) !== null && _c !== void 0 ? _c : "uscrt";
            const memo = (_d = txOptions === null || txOptions === void 0 ? void 0 : txOptions.memo) !== null && _d !== void 0 ? _d : "";
            const feeGranter = txOptions === null || txOptions === void 0 ? void 0 : txOptions.feeGranter;
            const explicitSignerData = txOptions === null || txOptions === void 0 ? void 0 : txOptions.explicitSignerData;
            const txRaw = yield this.sign(messages, {
                gas: String(gasLimit),
                amount: [
                    {
                        amount: String(gasToFee(gasLimit, gasPriceInFeeDenom)),
                        denom: feeDenom,
                    },
                ],
                granter: feeGranter,
            }, memo, explicitSignerData, simulate);
            return tx_2.TxRaw.encode(txRaw).finish();
        });
    }
    signAndBroadcast(messages, txOptions) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const txBytes = yield this.prepareAndSign(messages, txOptions);
            return this.broadcastTx(txBytes, (_a = txOptions === null || txOptions === void 0 ? void 0 : txOptions.broadcastTimeoutMs) !== null && _a !== void 0 ? _a : 60000, (_b = txOptions === null || txOptions === void 0 ? void 0 : txOptions.broadcastCheckIntervalMs) !== null && _b !== void 0 ? _b : 6000, (_c = txOptions === null || txOptions === void 0 ? void 0 : txOptions.broadcastMode) !== null && _c !== void 0 ? _c : BroadcastMode.Block, (_d = txOptions === null || txOptions === void 0 ? void 0 : txOptions.waitForCommit) !== null && _d !== void 0 ? _d : true, txOptions === null || txOptions === void 0 ? void 0 : txOptions.ibcTxsOptions);
        });
    }
    simulate(messages, txOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const txBytes = yield this.prepareAndSign(messages, txOptions, true);
            return service_pb_1.Service.Simulate(
            //@ts-ignore for some reason the type is tx_bytes but only works as txBytes
            { txBytes: (0, encoding_1.toBase64)(txBytes) }, { pathPrefix: this.url });
        });
    }
    /**
     * Gets account number and sequence from the API, creates a sign doc,
     * creates a single signature and assembles the signed transaction.
     *
     * The sign mode (SIGN_MODE_DIRECT or SIGN_MODE_LEGACY_AMINO_JSON) is determined by this client's signer.
     *
     * You can pass signer data (account number, sequence and chain ID) explicitly instead of querying them
     * from the chain. This is needed when signing for a multisig account, but it also allows for offline signing
     * (See the SigningStargateClient.offline constructor).
     */
    sign(messages, fee, memo, explicitSignerData, simulate = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountFromSigner = (yield this.wallet.getAccounts()).find((account) => account.address === this.address);
            if (!accountFromSigner) {
                throw new Error("Failed to retrieve account from signer");
            }
            let signerData;
            if (explicitSignerData) {
                signerData = explicitSignerData;
            }
            else {
                const { account } = yield this.query.auth.account({
                    address: this.address,
                });
                if (!account) {
                    throw new Error(`Cannot find account "${this.address}", make sure it has a balance.`);
                }
                if (account["@type"] !== "/cosmos.auth.v1beta1.BaseAccount") {
                    throw new Error(`Cannot sign with account of type "${account["@type"]}", can only sign with "/cosmos.auth.v1beta1.BaseAccount".`);
                }
                const baseAccount = account;
                signerData = {
                    accountNumber: Number(baseAccount.account_number),
                    sequence: Number(baseAccount.sequence),
                    chainId: this.chainId,
                };
            }
            if ((0, wallet_amino_1.isDirectSigner)(this.wallet)) {
                return this.signDirect(accountFromSigner, messages, fee, memo, signerData, simulate);
            }
            else {
                return this.signAmino(accountFromSigner, messages, fee, memo, signerData, simulate);
            }
        });
    }
    signAmino(account, messages, fee, memo, { accountNumber, sequence, chainId }, simulate = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, wallet_amino_1.isDirectSigner)(this.wallet)) {
                throw new Error("Wrong signer type! Expected AminoSigner or AminoEip191Signer.");
            }
            let signMode = (yield Promise.resolve().then(() => __importStar(require("./protobuf/cosmos/tx/signing/v1beta1/signing")))).SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
            if (typeof this.wallet.getSignMode === "function") {
                signMode = yield this.wallet.getSignMode();
            }
            const msgs = yield Promise.all(messages.map((msg) => __awaiter(this, void 0, void 0, function* () {
                yield this.populateCodeHash(msg);
                return msg.toAmino(this.encryptionUtils);
            })));
            const signDoc = makeSignDocAmino(msgs, fee, chainId, memo, accountNumber, sequence);
            let signed;
            let signature;
            if (!simulate) {
                ({ signature, signed } = yield this.wallet.signAmino(account.address, signDoc));
            }
            else {
                signed = signDoc;
                signature = getSimulateSignature();
            }
            const txBody = {
                type_url: "/cosmos.tx.v1beta1.TxBody",
                value: {
                    messages: yield Promise.all(messages.map((msg, index) => __awaiter(this, void 0, void 0, function* () {
                        yield this.populateCodeHash(msg);
                        const asProto = yield msg.toProto(this.encryptionUtils);
                        return asProto;
                    }))),
                    memo: memo,
                },
            };
            const txBodyBytes = yield this.encodeTx(txBody);
            const signedGasLimit = Number(signed.fee.gas);
            const signedSequence = Number(signed.sequence);
            const pubkey = yield encodePubkey((0, wallet_amino_1.encodeSecp256k1Pubkey)(account.pubkey));
            const signedAuthInfoBytes = yield makeAuthInfoBytes([{ pubkey, sequence: signedSequence }], signed.fee.amount, signedGasLimit, signed.fee.granter, signMode);
            return tx_2.TxRaw.fromPartial({
                body_bytes: txBodyBytes,
                auth_info_bytes: signedAuthInfoBytes,
                signatures: [(0, encoding_1.fromBase64)(signature.signature)],
            });
        });
    }
    populateCodeHash(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (msg instanceof _1.MsgExecuteContract) {
                if (!msg.codeHash) {
                    msg.codeHash = (yield this.query.compute.codeHashByContractAddress({
                        contract_address: msg.contractAddress,
                    })).code_hash;
                }
            }
            else if (msg instanceof _1.MsgInstantiateContract) {
                if (!msg.codeHash) {
                    msg.codeHash = (yield this.query.compute.codeHashByCodeId({
                        code_id: msg.codeId,
                    })).code_hash;
                }
            }
        });
    }
    encodeTx(txBody) {
        return __awaiter(this, void 0, void 0, function* () {
            const wrappedMessages = yield Promise.all(txBody.value.messages.map((message) => __awaiter(this, void 0, void 0, function* () {
                const binaryValue = yield message.encode();
                return any_1.Any.fromPartial({
                    type_url: message.type_url,
                    value: binaryValue,
                });
            })));
            const txBodyEncoded = tx_2.TxBody.fromPartial(Object.assign(Object.assign({}, txBody.value), { messages: wrappedMessages }));
            return tx_2.TxBody.encode(txBodyEncoded).finish();
        });
    }
    signDirect(account, messages, fee, memo, { accountNumber, sequence, chainId }, simulate = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, wallet_amino_1.isDirectSigner)(this.wallet)) {
                throw new Error("Wrong signer type! Expected DirectSigner.");
            }
            const txBody = {
                type_url: "/cosmos.tx.v1beta1.TxBody",
                value: {
                    messages: yield Promise.all(messages.map((msg, index) => __awaiter(this, void 0, void 0, function* () {
                        yield this.populateCodeHash(msg);
                        const asProto = yield msg.toProto(this.encryptionUtils);
                        return asProto;
                    }))),
                    memo: memo,
                },
            };
            const txBodyBytes = yield this.encodeTx(txBody);
            const pubkey = yield encodePubkey((0, wallet_amino_1.encodeSecp256k1Pubkey)(account.pubkey));
            const gasLimit = Number(fee.gas);
            const authInfoBytes = yield makeAuthInfoBytes([{ pubkey, sequence }], fee.amount, gasLimit, fee.granter);
            const signDoc = makeSignDocProto(txBodyBytes, authInfoBytes, chainId, accountNumber);
            let signed;
            let signature;
            if (!simulate) {
                ({ signature, signed } = yield this.wallet.signDirect(account.address, signDoc));
            }
            else {
                signed = signDoc;
                signature = getSimulateSignature();
            }
            if ((0, wallet_amino_1.isSignDoc)(signed)) {
                // Wallet
                return tx_2.TxRaw.fromPartial({
                    body_bytes: signed.body_bytes,
                    auth_info_bytes: signed.auth_info_bytes,
                    signatures: [(0, encoding_1.fromBase64)(signature.signature)],
                });
            }
            else if ((0, wallet_amino_1.isSignDocCamelCase)(signed)) {
                // cosmjs/Keplr
                return tx_2.TxRaw.fromPartial({
                    body_bytes: signed.bodyBytes,
                    auth_info_bytes: signed.authInfoBytes,
                    signatures: [(0, encoding_1.fromBase64)(signature.signature)],
                });
            }
            else {
                throw new Error(`unknown SignDoc instance: ${JSON.stringify(signed)}`);
            }
        });
    }
}
exports.SecretNetworkClient = SecretNetworkClient;
function sleep(ms) {
    return new Promise((accept) => setTimeout(accept, ms));
}
function gasToFee(gasLimit, gasPrice) {
    return Math.ceil(gasLimit * gasPrice);
}
exports.gasToFee = gasToFee;
/**
 * Creates and serializes an AuthInfo document.
 *
 * This implementation does not support different signing modes for the different signers.
 */
function makeAuthInfoBytes(signers, feeAmount, gasLimit, feeGranter, signMode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!signMode) {
            signMode = (yield Promise.resolve().then(() => __importStar(require("./protobuf/cosmos/tx/signing/v1beta1/signing"))))
                .SignMode.SIGN_MODE_DIRECT;
        }
        const authInfo = {
            signer_infos: makeSignerInfos(signers, signMode),
            fee: {
                amount: [...feeAmount],
                gas_limit: String(gasLimit),
                granter: feeGranter !== null && feeGranter !== void 0 ? feeGranter : "",
                payer: "",
            },
        };
        const { AuthInfo } = yield Promise.resolve().then(() => __importStar(require("./protobuf/cosmos/tx/v1beta1/tx")));
        return AuthInfo.encode(AuthInfo.fromPartial(authInfo)).finish();
    });
}
/**
 * Create signer infos from the provided signers.
 *
 * This implementation does not support different signing modes for the different signers.
 */
function makeSignerInfos(signers, signMode) {
    return signers.map(({ pubkey, sequence, }) => ({
        public_key: pubkey,
        mode_info: {
            single: { mode: signMode },
        },
        sequence: String(sequence),
    }));
}
function makeSignDocProto(bodyBytes, authInfoBytes, chainId, accountNumber) {
    return {
        body_bytes: bodyBytes,
        auth_info_bytes: authInfoBytes,
        chain_id: chainId,
        account_number: String(accountNumber),
        // cosmjs/Keplr
        bodyBytes,
        authInfoBytes,
        chainId,
        accountNumber: String(accountNumber),
    };
}
function encodePubkey(pubkey) {
    return __awaiter(this, void 0, void 0, function* () {
        const { Any } = yield Promise.resolve().then(() => __importStar(require("./protobuf/google/protobuf/any")));
        if (isSecp256k1Pubkey(pubkey)) {
            const { PubKey } = yield Promise.resolve().then(() => __importStar(require("./protobuf/cosmos/crypto/secp256k1/keys")));
            const pubkeyProto = PubKey.fromPartial({
                key: (0, encoding_1.fromBase64)(pubkey.value),
            });
            return Any.fromPartial({
                type_url: "/cosmos.crypto.secp256k1.PubKey",
                value: Uint8Array.from(PubKey.encode(pubkeyProto).finish()),
            });
        }
        else if (isMultisigThresholdPubkey(pubkey)) {
            const { LegacyAminoPubKey } = yield Promise.resolve().then(() => __importStar(require("./protobuf/cosmos/crypto/multisig/keys")));
            const pubkeyProto = LegacyAminoPubKey.fromPartial({
                threshold: Number(pubkey.value.threshold),
                public_keys: pubkey.value.pubkeys.map(encodePubkey),
            });
            return Any.fromPartial({
                type_url: "/cosmos.crypto.multisig.LegacyAminoPubKey",
                value: Uint8Array.from(LegacyAminoPubKey.encode(pubkeyProto).finish()),
            });
        }
        else {
            throw new Error(`Pubkey type ${pubkey.type} not recognized`);
        }
    });
}
function isSecp256k1Pubkey(pubkey) {
    return pubkey.type === "tendermint/PubKeySecp256k1";
}
function isMultisigThresholdPubkey(pubkey) {
    return pubkey.type === "tendermint/PubKeyMultisigThreshold";
}
function makeSignDocAmino(msgs, fee, chainId, memo, accountNumber, sequence) {
    return {
        chain_id: chainId,
        account_number: String(accountNumber),
        sequence: String(sequence),
        fee: fee,
        msgs: msgs,
        memo: memo || "",
    };
}
var TxResultCode;
(function (TxResultCode) {
    /** Success is returned if the transaction executed successfully */
    TxResultCode[TxResultCode["Success"] = 0] = "Success";
    /** ErrInternal should never be exposed, but we reserve this code for non-specified errors */
    TxResultCode[TxResultCode["ErrInternal"] = 1] = "ErrInternal";
    /** ErrTxDecode is returned if we cannot parse a transaction */
    TxResultCode[TxResultCode["ErrTxDecode"] = 2] = "ErrTxDecode";
    /** ErrInvalidSequence is used the sequence number (nonce) is incorrect for the signature */
    TxResultCode[TxResultCode["ErrInvalidSequence"] = 3] = "ErrInvalidSequence";
    /** ErrUnauthorized is used whenever a request without sufficient authorization is handled. */
    TxResultCode[TxResultCode["ErrUnauthorized"] = 4] = "ErrUnauthorized";
    /** ErrInsufficientFunds is used when the account cannot pay requested amount. */
    TxResultCode[TxResultCode["ErrInsufficientFunds"] = 5] = "ErrInsufficientFunds";
    /** ErrUnknownRequest to doc */
    TxResultCode[TxResultCode["ErrUnknownRequest"] = 6] = "ErrUnknownRequest";
    /** ErrInvalidAddress to doc */
    TxResultCode[TxResultCode["ErrInvalidAddress"] = 7] = "ErrInvalidAddress";
    /** ErrInvalidPubKey to doc */
    TxResultCode[TxResultCode["ErrInvalidPubKey"] = 8] = "ErrInvalidPubKey";
    /** ErrUnknownAddress to doc */
    TxResultCode[TxResultCode["ErrUnknownAddress"] = 9] = "ErrUnknownAddress";
    /** ErrInvalidCoins to doc */
    TxResultCode[TxResultCode["ErrInvalidCoins"] = 10] = "ErrInvalidCoins";
    /** ErrOutOfGas to doc */
    TxResultCode[TxResultCode["ErrOutOfGas"] = 11] = "ErrOutOfGas";
    /** ErrMemoTooLarge to doc */
    TxResultCode[TxResultCode["ErrMemoTooLarge"] = 12] = "ErrMemoTooLarge";
    /** ErrInsufficientFee to doc */
    TxResultCode[TxResultCode["ErrInsufficientFee"] = 13] = "ErrInsufficientFee";
    /** ErrTooManySignatures to doc */
    TxResultCode[TxResultCode["ErrTooManySignatures"] = 14] = "ErrTooManySignatures";
    /** ErrNoSignatures to doc */
    TxResultCode[TxResultCode["ErrNoSignatures"] = 15] = "ErrNoSignatures";
    /** ErrJSONMarshal defines an ABCI typed JSON marshalling error */
    TxResultCode[TxResultCode["ErrJSONMarshal"] = 16] = "ErrJSONMarshal";
    /** ErrJSONUnmarshal defines an ABCI typed JSON unmarshalling error */
    TxResultCode[TxResultCode["ErrJSONUnmarshal"] = 17] = "ErrJSONUnmarshal";
    /** ErrInvalidRequest defines an ABCI typed error where the request contains invalid data. */
    TxResultCode[TxResultCode["ErrInvalidRequest"] = 18] = "ErrInvalidRequest";
    /** ErrTxInMempoolCache defines an ABCI typed error where a tx already exists in the mempool. */
    TxResultCode[TxResultCode["ErrTxInMempoolCache"] = 19] = "ErrTxInMempoolCache";
    /** ErrMempoolIsFull defines an ABCI typed error where the mempool is full. */
    TxResultCode[TxResultCode["ErrMempoolIsFull"] = 20] = "ErrMempoolIsFull";
    /** ErrTxTooLarge defines an ABCI typed error where tx is too large. */
    TxResultCode[TxResultCode["ErrTxTooLarge"] = 21] = "ErrTxTooLarge";
    /** ErrKeyNotFound defines an error when the key doesn't exist */
    TxResultCode[TxResultCode["ErrKeyNotFound"] = 22] = "ErrKeyNotFound";
    /** ErrWrongPassword defines an error when the key password is invalid. */
    TxResultCode[TxResultCode["ErrWrongPassword"] = 23] = "ErrWrongPassword";
    /** ErrorInvalidSigner defines an error when the tx intended signer does not match the given signer. */
    TxResultCode[TxResultCode["ErrorInvalidSigner"] = 24] = "ErrorInvalidSigner";
    /** ErrorInvalidGasAdjustment defines an error for an invalid gas adjustment */
    TxResultCode[TxResultCode["ErrorInvalidGasAdjustment"] = 25] = "ErrorInvalidGasAdjustment";
    /** ErrInvalidHeight defines an error for an invalid height */
    TxResultCode[TxResultCode["ErrInvalidHeight"] = 26] = "ErrInvalidHeight";
    /** ErrInvalidVersion defines a general error for an invalid version */
    TxResultCode[TxResultCode["ErrInvalidVersion"] = 27] = "ErrInvalidVersion";
    /** ErrInvalidChainID defines an error when the chain-id is invalid. */
    TxResultCode[TxResultCode["ErrInvalidChainID"] = 28] = "ErrInvalidChainID";
    /** ErrInvalidType defines an error an invalid type. */
    TxResultCode[TxResultCode["ErrInvalidType"] = 29] = "ErrInvalidType";
    /** ErrTxTimeoutHeight defines an error for when a tx is rejected out due to an explicitly set timeout height. */
    TxResultCode[TxResultCode["ErrTxTimeoutHeight"] = 30] = "ErrTxTimeoutHeight";
    /** ErrUnknownExtensionOptions defines an error for unknown extension options. */
    TxResultCode[TxResultCode["ErrUnknownExtensionOptions"] = 31] = "ErrUnknownExtensionOptions";
    /** ErrWrongSequence defines an error where the account sequence defined in the signer info doesn't match the account's actual sequence number. */
    TxResultCode[TxResultCode["ErrWrongSequence"] = 32] = "ErrWrongSequence";
    /** ErrPackAny defines an error when packing a protobuf message to Any fails. */
    TxResultCode[TxResultCode["ErrPackAny"] = 33] = "ErrPackAny";
    /** ErrUnpackAny defines an error when unpacking a protobuf message from Any fails. */
    TxResultCode[TxResultCode["ErrUnpackAny"] = 34] = "ErrUnpackAny";
    /** ErrLogic defines an internal logic error, e.g. an invariant or assertion that is violated. It is a programmer error, not a user-facing error. */
    TxResultCode[TxResultCode["ErrLogic"] = 35] = "ErrLogic";
    /** ErrConflict defines a conflict error, e.g. when two goroutines try to access the same resource and one of them fails. */
    TxResultCode[TxResultCode["ErrConflict"] = 36] = "ErrConflict";
    /** ErrNotSupported is returned when we call a branch of a code which is currently not supported. */
    TxResultCode[TxResultCode["ErrNotSupported"] = 37] = "ErrNotSupported";
    /** ErrNotFound defines an error when requested entity doesn't exist in the state. */
    TxResultCode[TxResultCode["ErrNotFound"] = 38] = "ErrNotFound";
    /** ErrIO should be used to wrap internal errors caused by external operation. Examples: not DB domain error, file writing etc... */
    TxResultCode[TxResultCode["ErrIO"] = 39] = "ErrIO";
    /** ErrAppConfig defines an error occurred if min-gas-prices field in BaseConfig is empty. */
    TxResultCode[TxResultCode["ErrAppConfig"] = 40] = "ErrAppConfig";
    /** ErrPanic is only set when we recover from a panic, so we know to redact potentially sensitive system info. */
    TxResultCode[TxResultCode["ErrPanic"] = 111222] = "ErrPanic";
})(TxResultCode = exports.TxResultCode || (exports.TxResultCode = {}));
/**
 * Recursively converts an object of type `{ type_url: string; value: any; }`
 * to type `{ "@type": string; ...values }`
 */
function protobufJsonToGrpcGatewayJson(obj) {
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(protobufJsonToGrpcGatewayJson);
    }
    if (Object.keys(obj).length === 2 &&
        typeof obj["type_url"] === "string" &&
        typeof obj["value"] === "object") {
        return Object.assign({ "@type": obj["type_url"] }, protobufJsonToGrpcGatewayJson(obj["value"]));
    }
    const result = {};
    Object.keys(obj).forEach((key) => {
        result[key] = protobufJsonToGrpcGatewayJson(obj[key]);
    });
    return result;
}
function getSimulateSignature() {
    return {
        pub_key: {
            type: "tendermint/PubKeySecp256k1",
            value: (0, encoding_1.toBase64)(new Uint8Array(33).fill(0)),
        },
        signature: (0, encoding_1.toBase64)(new Uint8Array(64).fill(0)),
    };
}
//# sourceMappingURL=secret_network_client.js.map