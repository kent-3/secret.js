"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgRegistry = void 0;
const tx_1 = require("../protobuf/cosmos/authz/v1beta1/tx");
const tx_2 = require("../protobuf/cosmos/bank/v1beta1/tx");
const tx_3 = require("../protobuf/cosmos/crisis/v1beta1/tx");
const tx_4 = require("../protobuf/cosmos/distribution/v1beta1/tx");
const tx_5 = require("../protobuf/cosmos/evidence/v1beta1/tx");
const tx_6 = require("../protobuf/cosmos/feegrant/v1beta1/tx");
const tx_7 = require("../protobuf/cosmos/gov/v1beta1/tx");
const tx_8 = require("../protobuf/cosmos/slashing/v1beta1/tx");
const tx_9 = require("../protobuf/cosmos/staking/v1beta1/tx");
const tx_10 = require("../protobuf/cosmos/vesting/v1beta1/tx");
const tx_11 = require("../protobuf/ibc/applications/transfer/v1/tx");
const tx_12 = require("../protobuf/ibc/core/channel/v1/tx");
const tx_13 = require("../protobuf/ibc/core/client/v1/tx");
const tx_14 = require("../protobuf/ibc/core/connection/v1/tx");
const msg_1 = require("../protobuf/secret/compute/v1beta1/msg");
const msg_2 = require("../protobuf/secret/registration/v1beta1/msg");
__exportStar(require("./authz"), exports);
__exportStar(require("./bank"), exports);
__exportStar(require("./compute"), exports);
__exportStar(require("./crisis"), exports);
__exportStar(require("./distribution"), exports);
__exportStar(require("./evidence"), exports);
__exportStar(require("./feegrant"), exports);
__exportStar(require("./gov"), exports);
__exportStar(require("./ibc_channel"), exports);
__exportStar(require("./ibc_client"), exports);
__exportStar(require("./ibc_connection"), exports);
__exportStar(require("./ibc_transfer"), exports);
__exportStar(require("./slashing"), exports);
__exportStar(require("./staking"), exports);
__exportStar(require("./vesting"), exports);
__exportStar(require("./types"), exports);
exports.MsgRegistry = new Map([
    ["/cosmos.authz.v1beta1.MsgGrant", tx_1.MsgGrant],
    ["/cosmos.authz.v1beta1.MsgExec", tx_1.MsgExec],
    ["/cosmos.authz.v1beta1.MsgRevoke", tx_1.MsgRevoke],
    ["/cosmos.bank.v1beta1.MsgSend", tx_2.MsgSend],
    ["/cosmos.bank.v1beta1.MsgMultiSend", tx_2.MsgMultiSend],
    ["/cosmos.crisis.v1beta1.MsgVerifyInvariant", tx_3.MsgVerifyInvariant],
    ["/cosmos.distribution.v1beta1.MsgSetWithdrawAddress", tx_4.MsgSetWithdrawAddress],
    [
        "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
        tx_4.MsgWithdrawDelegatorReward,
    ],
    [
        "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission",
        tx_4.MsgWithdrawValidatorCommission,
    ],
    ["/cosmos.distribution.v1beta1.MsgFundCommunityPool", tx_4.MsgFundCommunityPool],
    ["/cosmos.distribution.v1beta1.MsgSetAutoRestake", tx_4.MsgSetAutoRestake],
    ["/cosmos.evidence.v1beta1.MsgSubmitEvidence", tx_5.MsgSubmitEvidence],
    ["/cosmos.feegrant.v1beta1.MsgGrantAllowance", tx_6.MsgGrantAllowance],
    ["/cosmos.feegrant.v1beta1.MsgRevokeAllowance", tx_6.MsgRevokeAllowance],
    ["/cosmos.gov.v1beta1.MsgSubmitProposal", tx_7.MsgSubmitProposal],
    ["/cosmos.gov.v1beta1.MsgVote", tx_7.MsgVote],
    ["/cosmos.gov.v1beta1.MsgVoteWeighted", tx_7.MsgVoteWeighted],
    ["/cosmos.gov.v1beta1.MsgDeposit", tx_7.MsgDeposit],
    ["/cosmos.slashing.v1beta1.MsgUnjail", tx_8.MsgUnjail],
    ["/cosmos.staking.v1beta1.MsgCreateValidator", tx_9.MsgCreateValidator],
    ["/cosmos.staking.v1beta1.MsgEditValidator", tx_9.MsgEditValidator],
    ["/cosmos.staking.v1beta1.MsgDelegate", tx_9.MsgDelegate],
    ["/cosmos.staking.v1beta1.MsgBeginRedelegate", tx_9.MsgBeginRedelegate],
    ["/cosmos.staking.v1beta1.MsgUndelegate", tx_9.MsgUndelegate],
    ["/ibc.applications.transfer.v1.MsgTransfer", tx_11.MsgTransfer],
    ["/ibc.core.channel.v1.MsgChannelOpenInit", tx_12.MsgChannelOpenInit],
    ["/ibc.core.channel.v1.MsgChannelOpenTry", tx_12.MsgChannelOpenTry],
    ["/ibc.core.channel.v1.MsgChannelOpenAck", tx_12.MsgChannelOpenAck],
    ["/ibc.core.channel.v1.MsgChannelOpenConfirm", tx_12.MsgChannelOpenConfirm],
    ["/ibc.core.channel.v1.MsgChannelCloseInit", tx_12.MsgChannelCloseInit],
    ["/ibc.core.channel.v1.MsgChannelCloseConfirm", tx_12.MsgChannelCloseConfirm],
    ["/ibc.core.channel.v1.MsgRecvPacket", tx_12.MsgRecvPacket],
    ["/ibc.core.channel.v1.MsgTimeout", tx_12.MsgTimeout],
    ["/ibc.core.channel.v1.MsgTimeoutOnClose", tx_12.MsgTimeoutOnClose],
    ["/ibc.core.channel.v1.MsgAcknowledgement", tx_12.MsgAcknowledgement],
    ["/ibc.core.client.v1.MsgCreateClient", tx_13.MsgCreateClient],
    ["/ibc.core.client.v1.MsgUpdateClient", tx_13.MsgUpdateClient],
    ["/ibc.core.client.v1.MsgUpgradeClient", tx_13.MsgUpgradeClient],
    ["/ibc.core.client.v1.MsgSubmitMisbehaviour", tx_13.MsgSubmitMisbehaviour],
    ["/ibc.core.connection.v1.MsgConnectionOpenInit", tx_14.MsgConnectionOpenInit],
    ["/ibc.core.connection.v1.MsgConnectionOpenTry", tx_14.MsgConnectionOpenTry],
    ["/ibc.core.connection.v1.MsgConnectionOpenAck", tx_14.MsgConnectionOpenAck],
    [
        "/ibc.core.connection.v1.MsgConnectionOpenConfirm",
        tx_14.MsgConnectionOpenConfirm,
    ],
    ["/secret.compute.v1beta1.MsgStoreCode", msg_1.MsgStoreCode],
    ["/secret.compute.v1beta1.MsgInstantiateContract", msg_1.MsgInstantiateContract],
    ["/secret.compute.v1beta1.MsgExecuteContract", msg_1.MsgExecuteContract],
    ["/secret.registration.v1beta1.RaAuthenticate", msg_2.RaAuthenticate],
    ["/cosmos.vesting.v1beta1.MsgCreateVestingAccount", tx_10.MsgCreateVestingAccount],
]);
//# sourceMappingURL=index.js.map