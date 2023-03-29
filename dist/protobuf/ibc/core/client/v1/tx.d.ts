import * as _m0 from "protobufjs/minimal";
import { Any } from "../../../../google/protobuf/any";
export declare const protobufPackage = "ibc.core.client.v1";
/** MsgCreateClient defines a message to create an IBC client */
export interface MsgCreateClient {
    /** light client state */
    client_state?: Any;
    /**
     * consensus state associated with the client that corresponds to a given
     * height.
     */
    consensus_state?: Any;
    /** signer address */
    signer: string;
}
/** MsgCreateClientResponse defines the Msg/CreateClient response type. */
export interface MsgCreateClientResponse {
}
/**
 * MsgUpdateClient defines an sdk.Msg to update a IBC client state using
 * the given header.
 */
export interface MsgUpdateClient {
    /** client unique identifier */
    client_id: string;
    /** header to update the light client */
    header?: Any;
    /** signer address */
    signer: string;
}
/** MsgUpdateClientResponse defines the Msg/UpdateClient response type. */
export interface MsgUpdateClientResponse {
}
/**
 * MsgUpgradeClient defines an sdk.Msg to upgrade an IBC client to a new client
 * state
 */
export interface MsgUpgradeClient {
    /** client unique identifier */
    client_id: string;
    /** upgraded client state */
    client_state?: Any;
    /**
     * upgraded consensus state, only contains enough information to serve as a
     * basis of trust in update logic
     */
    consensus_state?: Any;
    /** proof that old chain committed to new client */
    proof_upgrade_client: Uint8Array;
    /** proof that old chain committed to new consensus state */
    proof_upgrade_consensus_state: Uint8Array;
    /** signer address */
    signer: string;
}
/** MsgUpgradeClientResponse defines the Msg/UpgradeClient response type. */
export interface MsgUpgradeClientResponse {
}
/**
 * MsgSubmitMisbehaviour defines an sdk.Msg type that submits Evidence for
 * light client misbehaviour.
 */
export interface MsgSubmitMisbehaviour {
    /** client unique identifier */
    client_id: string;
    /** misbehaviour used for freezing the light client */
    misbehaviour?: Any;
    /** signer address */
    signer: string;
}
/**
 * MsgSubmitMisbehaviourResponse defines the Msg/SubmitMisbehaviour response
 * type.
 */
export interface MsgSubmitMisbehaviourResponse {
}
export declare const MsgCreateClient: {
    encode(message: MsgCreateClient, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): MsgCreateClient;
    fromJSON(object: any): MsgCreateClient;
    toJSON(message: MsgCreateClient): unknown;
    fromPartial<I extends {
        client_state?: {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } | undefined;
        consensus_state?: {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } | undefined;
        signer?: string | undefined;
    } & {
        client_state?: ({
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["client_state"], keyof Any>, never>) | undefined;
        consensus_state?: ({
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["consensus_state"], keyof Any>, never>) | undefined;
        signer?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgCreateClient>, never>>(object: I): MsgCreateClient;
};
export declare const MsgCreateClientResponse: {
    encode(_: MsgCreateClientResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): MsgCreateClientResponse;
    fromJSON(_: any): MsgCreateClientResponse;
    toJSON(_: MsgCreateClientResponse): unknown;
    fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(_: I): MsgCreateClientResponse;
};
export declare const MsgUpdateClient: {
    encode(message: MsgUpdateClient, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): MsgUpdateClient;
    fromJSON(object: any): MsgUpdateClient;
    toJSON(message: MsgUpdateClient): unknown;
    fromPartial<I extends {
        client_id?: string | undefined;
        header?: {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } | undefined;
        signer?: string | undefined;
    } & {
        client_id?: string | undefined;
        header?: ({
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["header"], keyof Any>, never>) | undefined;
        signer?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgUpdateClient>, never>>(object: I): MsgUpdateClient;
};
export declare const MsgUpdateClientResponse: {
    encode(_: MsgUpdateClientResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): MsgUpdateClientResponse;
    fromJSON(_: any): MsgUpdateClientResponse;
    toJSON(_: MsgUpdateClientResponse): unknown;
    fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(_: I): MsgUpdateClientResponse;
};
export declare const MsgUpgradeClient: {
    encode(message: MsgUpgradeClient, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): MsgUpgradeClient;
    fromJSON(object: any): MsgUpgradeClient;
    toJSON(message: MsgUpgradeClient): unknown;
    fromPartial<I extends {
        client_id?: string | undefined;
        client_state?: {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } | undefined;
        consensus_state?: {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } | undefined;
        proof_upgrade_client?: Uint8Array | undefined;
        proof_upgrade_consensus_state?: Uint8Array | undefined;
        signer?: string | undefined;
    } & {
        client_id?: string | undefined;
        client_state?: ({
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["client_state"], keyof Any>, never>) | undefined;
        consensus_state?: ({
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["consensus_state"], keyof Any>, never>) | undefined;
        proof_upgrade_client?: Uint8Array | undefined;
        proof_upgrade_consensus_state?: Uint8Array | undefined;
        signer?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgUpgradeClient>, never>>(object: I): MsgUpgradeClient;
};
export declare const MsgUpgradeClientResponse: {
    encode(_: MsgUpgradeClientResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): MsgUpgradeClientResponse;
    fromJSON(_: any): MsgUpgradeClientResponse;
    toJSON(_: MsgUpgradeClientResponse): unknown;
    fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(_: I): MsgUpgradeClientResponse;
};
export declare const MsgSubmitMisbehaviour: {
    encode(message: MsgSubmitMisbehaviour, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): MsgSubmitMisbehaviour;
    fromJSON(object: any): MsgSubmitMisbehaviour;
    toJSON(message: MsgSubmitMisbehaviour): unknown;
    fromPartial<I extends {
        client_id?: string | undefined;
        misbehaviour?: {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } | undefined;
        signer?: string | undefined;
    } & {
        client_id?: string | undefined;
        misbehaviour?: ({
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["misbehaviour"], keyof Any>, never>) | undefined;
        signer?: string | undefined;
    } & Record<Exclude<keyof I, keyof MsgSubmitMisbehaviour>, never>>(object: I): MsgSubmitMisbehaviour;
};
export declare const MsgSubmitMisbehaviourResponse: {
    encode(_: MsgSubmitMisbehaviourResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): MsgSubmitMisbehaviourResponse;
    fromJSON(_: any): MsgSubmitMisbehaviourResponse;
    toJSON(_: MsgSubmitMisbehaviourResponse): unknown;
    fromPartial<I extends {} & {} & Record<Exclude<keyof I, never>, never>>(_: I): MsgSubmitMisbehaviourResponse;
};
/** Msg defines the ibc/client Msg service. */
export interface Msg {
    /** CreateClient defines a rpc handler method for MsgCreateClient. */
    CreateClient(request: MsgCreateClient): Promise<MsgCreateClientResponse>;
    /** UpdateClient defines a rpc handler method for MsgUpdateClient. */
    UpdateClient(request: MsgUpdateClient): Promise<MsgUpdateClientResponse>;
    /** UpgradeClient defines a rpc handler method for MsgUpgradeClient. */
    UpgradeClient(request: MsgUpgradeClient): Promise<MsgUpgradeClientResponse>;
    /** SubmitMisbehaviour defines a rpc handler method for MsgSubmitMisbehaviour. */
    SubmitMisbehaviour(request: MsgSubmitMisbehaviour): Promise<MsgSubmitMisbehaviourResponse>;
}
export declare class MsgClientImpl implements Msg {
    private readonly rpc;
    constructor(rpc: Rpc);
    CreateClient(request: MsgCreateClient): Promise<MsgCreateClientResponse>;
    UpdateClient(request: MsgUpdateClient): Promise<MsgUpdateClientResponse>;
    UpgradeClient(request: MsgUpgradeClient): Promise<MsgUpgradeClientResponse>;
    SubmitMisbehaviour(request: MsgSubmitMisbehaviour): Promise<MsgSubmitMisbehaviourResponse>;
}
interface Rpc {
    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}
declare type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
declare type KeysOfUnion<T> = T extends T ? keyof T : never;
export declare type Exact<P, I extends P> = P extends Builtin ? P : P & {
    [K in keyof P]: Exact<P[K], I[K]>;
} & Record<Exclude<keyof I, KeysOfUnion<P>>, never>;
export {};
//# sourceMappingURL=tx.d.ts.map