import * as _m0 from "protobufjs/minimal";
import { Any } from "../../../google/protobuf/any";
import { SignMode } from "../signing/v1beta1/signing";
import { CompactBitArray } from "../../crypto/multisig/v1beta1/multisig";
import { Coin } from "../../base/v1beta1/coin";
export declare const protobufPackage = "cosmos.tx.v1beta1";
/** Txs is an array of Tx, used to generate the code needed for the enclave to unpack txs and validate them */
export interface Txs {
    tx: Uint8Array[];
}
/** Tx is the standard type used for broadcasting transactions. */
export interface Tx {
    /** body is the processable content of the transaction */
    body?: TxBody;
    /**
     * auth_info is the authorization related content of the transaction,
     * specifically signers, signer modes and fee
     */
    auth_info?: AuthInfo;
    /**
     * signatures is a list of signatures that matches the length and order of
     * AuthInfo's signer_infos to allow connecting signature meta information like
     * public key and signing mode by position.
     */
    signatures: Uint8Array[];
}
/**
 * TxRaw is a variant of Tx that pins the signer's exact binary representation
 * of body and auth_info. This is used for signing, broadcasting and
 * verification. The binary `serialize(tx: TxRaw)` is stored in Tendermint and
 * the hash `sha256(serialize(tx: TxRaw))` becomes the "txhash", commonly used
 * as the transaction ID.
 */
export interface TxRaw {
    /**
     * body_bytes is a protobuf serialization of a TxBody that matches the
     * representation in SignDoc.
     */
    body_bytes: Uint8Array;
    /**
     * auth_info_bytes is a protobuf serialization of an AuthInfo that matches the
     * representation in SignDoc.
     */
    auth_info_bytes: Uint8Array;
    /**
     * signatures is a list of signatures that matches the length and order of
     * AuthInfo's signer_infos to allow connecting signature meta information like
     * public key and signing mode by position.
     */
    signatures: Uint8Array[];
}
/** SignDoc is the type used for generating sign bytes for SIGN_MODE_DIRECT. */
export interface SignDoc {
    /**
     * body_bytes is protobuf serialization of a TxBody that matches the
     * representation in TxRaw.
     */
    body_bytes: Uint8Array;
    /**
     * auth_info_bytes is a protobuf serialization of an AuthInfo that matches the
     * representation in TxRaw.
     */
    auth_info_bytes: Uint8Array;
    /**
     * chain_id is the unique identifier of the chain this transaction targets.
     * It prevents signed transactions from being used on another chain by an
     * attacker
     */
    chain_id: string;
    /** account_number is the account number of the account in state */
    account_number: string;
}
/** TxBody is the body of a transaction that all signers sign over. */
export interface TxBody {
    /**
     * messages is a list of messages to be executed. The required signers of
     * those messages define the number and order of elements in AuthInfo's
     * signer_infos and Tx's signatures. Each required signer address is added to
     * the list only the first time it occurs.
     * By convention, the first required signer (usually from the first message)
     * is referred to as the primary signer and pays the fee for the whole
     * transaction.
     */
    messages: Any[];
    /**
     * memo is any arbitrary note/comment to be added to the transaction.
     * WARNING: in clients, any publicly exposed text should not be called memo,
     * but should be called `note` instead (see https://github.com/cosmos/cosmos-sdk/issues/9122).
     */
    memo: string;
    /**
     * timeout is the block height after which this transaction will not
     * be processed by the chain
     */
    timeout_height: string;
    /**
     * extension_options are arbitrary options that can be added by chains
     * when the default options are not sufficient. If any of these are present
     * and can't be handled, the transaction will be rejected
     */
    extension_options: Any[];
    /**
     * extension_options are arbitrary options that can be added by chains
     * when the default options are not sufficient. If any of these are present
     * and can't be handled, they will be ignored
     */
    non_critical_extension_options: Any[];
}
/**
 * AuthInfo describes the fee and signer modes that are used to sign a
 * transaction.
 */
export interface AuthInfo {
    /**
     * signer_infos defines the signing modes for the required signers. The number
     * and order of elements must match the required signers from TxBody's
     * messages. The first element is the primary signer and the one which pays
     * the fee.
     */
    signer_infos: SignerInfo[];
    /**
     * Fee is the fee and gas limit for the transaction. The first signer is the
     * primary signer and the one which pays the fee. The fee can be calculated
     * based on the cost of evaluating the body and doing signature verification
     * of the signers. This can be estimated via simulation.
     */
    fee?: Fee;
}
/**
 * SignerInfo describes the public key and signing mode of a single top-level
 * signer.
 */
export interface SignerInfo {
    /**
     * public_key is the public key of the signer. It is optional for accounts
     * that already exist in state. If unset, the verifier can use the required \
     * signer address for this position and lookup the public key.
     */
    public_key?: Any;
    /**
     * mode_info describes the signing mode of the signer and is a nested
     * structure to support nested multisig pubkey's
     */
    mode_info?: ModeInfo;
    /**
     * sequence is the sequence of the account, which describes the
     * number of committed transactions signed by a given address. It is used to
     * prevent replay attacks.
     */
    sequence: string;
}
/** ModeInfo describes the signing mode of a single or nested multisig signer. */
export interface ModeInfo {
    /** single represents a single signer */
    single?: ModeInfo_Single | undefined;
    /** multi represents a nested multisig signer */
    multi?: ModeInfo_Multi | undefined;
}
/**
 * Single is the mode info for a single signer. It is structured as a message
 * to allow for additional fields such as locale for SIGN_MODE_TEXTUAL in the
 * future
 */
export interface ModeInfo_Single {
    /** mode is the signing mode of the single signer */
    mode: SignMode;
}
/** Multi is the mode info for a multisig public key */
export interface ModeInfo_Multi {
    /** bitarray specifies which keys within the multisig are signing */
    bitarray?: CompactBitArray;
    /**
     * mode_infos is the corresponding modes of the signers of the multisig
     * which could include nested multisig public keys
     */
    mode_infos: ModeInfo[];
}
/**
 * Fee includes the amount of coins paid in fees and the maximum
 * gas to be used by the transaction. The ratio yields an effective "gasprice",
 * which must be above some miminum to be accepted into the mempool.
 */
export interface Fee {
    /** amount is the amount of coins to be paid as a fee */
    amount: Coin[];
    /**
     * gas_limit is the maximum gas that can be used in transaction processing
     * before an out of gas error occurs
     */
    gas_limit: string;
    /**
     * if unset, the first signer is responsible for paying the fees. If set, the specified account must pay the fees.
     * the payer must be a tx signer (and thus have signed this field in AuthInfo).
     * setting this field does *not* change the ordering of required signers for the transaction.
     */
    payer: string;
    /**
     * if set, the fee payer (either the first signer or the value of the payer field) requests that a fee grant be used
     * to pay fees instead of the fee payer's own balance. If an appropriate fee grant does not exist or the chain does
     * not support fee grants, this will fail
     */
    granter: string;
}
export declare const Txs: {
    encode(message: Txs, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): Txs;
    fromJSON(object: any): Txs;
    toJSON(message: Txs): unknown;
    fromPartial<I extends {
        tx?: Uint8Array[] | undefined;
    } & {
        tx?: (Uint8Array[] & Uint8Array[] & Record<Exclude<keyof I["tx"], keyof Uint8Array[]>, never>) | undefined;
    } & Record<Exclude<keyof I, "tx">, never>>(object: I): Txs;
};
export declare const Tx: {
    encode(message: Tx, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): Tx;
    fromJSON(object: any): Tx;
    toJSON(message: Tx): unknown;
    fromPartial<I extends {
        body?: {
            messages?: {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            }[] | undefined;
            memo?: string | undefined;
            timeout_height?: string | undefined;
            extension_options?: {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            }[] | undefined;
            non_critical_extension_options?: {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            }[] | undefined;
        } | undefined;
        auth_info?: {
            signer_infos?: {
                public_key?: {
                    type_url?: string | undefined;
                    value?: Uint8Array | undefined;
                } | undefined;
                mode_info?: {
                    single?: {
                        mode?: SignMode | undefined;
                    } | undefined;
                    multi?: {
                        bitarray?: {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } | undefined;
                        mode_infos?: any[] | undefined;
                    } | undefined;
                } | undefined;
                sequence?: string | undefined;
            }[] | undefined;
            fee?: {
                amount?: {
                    denom?: string | undefined;
                    amount?: string | undefined;
                }[] | undefined;
                gas_limit?: string | undefined;
                payer?: string | undefined;
                granter?: string | undefined;
            } | undefined;
        } | undefined;
        signatures?: Uint8Array[] | undefined;
    } & {
        body?: ({
            messages?: {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            }[] | undefined;
            memo?: string | undefined;
            timeout_height?: string | undefined;
            extension_options?: {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            }[] | undefined;
            non_critical_extension_options?: {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            }[] | undefined;
        } & {
            messages?: ({
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            }[] & ({
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            } & {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["body"]["messages"][number], keyof Any>, never>)[] & Record<Exclude<keyof I["body"]["messages"], keyof {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            }[]>, never>) | undefined;
            memo?: string | undefined;
            timeout_height?: string | undefined;
            extension_options?: ({
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            }[] & ({
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            } & {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["body"]["extension_options"][number], keyof Any>, never>)[] & Record<Exclude<keyof I["body"]["extension_options"], keyof {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            }[]>, never>) | undefined;
            non_critical_extension_options?: ({
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            }[] & ({
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            } & {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["body"]["non_critical_extension_options"][number], keyof Any>, never>)[] & Record<Exclude<keyof I["body"]["non_critical_extension_options"], keyof {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            }[]>, never>) | undefined;
        } & Record<Exclude<keyof I["body"], keyof TxBody>, never>) | undefined;
        auth_info?: ({
            signer_infos?: {
                public_key?: {
                    type_url?: string | undefined;
                    value?: Uint8Array | undefined;
                } | undefined;
                mode_info?: {
                    single?: {
                        mode?: SignMode | undefined;
                    } | undefined;
                    multi?: {
                        bitarray?: {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } | undefined;
                        mode_infos?: any[] | undefined;
                    } | undefined;
                } | undefined;
                sequence?: string | undefined;
            }[] | undefined;
            fee?: {
                amount?: {
                    denom?: string | undefined;
                    amount?: string | undefined;
                }[] | undefined;
                gas_limit?: string | undefined;
                payer?: string | undefined;
                granter?: string | undefined;
            } | undefined;
        } & {
            signer_infos?: ({
                public_key?: {
                    type_url?: string | undefined;
                    value?: Uint8Array | undefined;
                } | undefined;
                mode_info?: {
                    single?: {
                        mode?: SignMode | undefined;
                    } | undefined;
                    multi?: {
                        bitarray?: {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } | undefined;
                        mode_infos?: any[] | undefined;
                    } | undefined;
                } | undefined;
                sequence?: string | undefined;
            }[] & ({
                public_key?: {
                    type_url?: string | undefined;
                    value?: Uint8Array | undefined;
                } | undefined;
                mode_info?: {
                    single?: {
                        mode?: SignMode | undefined;
                    } | undefined;
                    multi?: {
                        bitarray?: {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } | undefined;
                        mode_infos?: any[] | undefined;
                    } | undefined;
                } | undefined;
                sequence?: string | undefined;
            } & {
                public_key?: ({
                    type_url?: string | undefined;
                    value?: Uint8Array | undefined;
                } & {
                    type_url?: string | undefined;
                    value?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["public_key"], keyof Any>, never>) | undefined;
                mode_info?: ({
                    single?: {
                        mode?: SignMode | undefined;
                    } | undefined;
                    multi?: {
                        bitarray?: {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } | undefined;
                        mode_infos?: any[] | undefined;
                    } | undefined;
                } & {
                    single?: ({
                        mode?: SignMode | undefined;
                    } & {
                        mode?: SignMode | undefined;
                    } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["single"], "mode">, never>) | undefined;
                    multi?: ({
                        bitarray?: {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } | undefined;
                        mode_infos?: any[] | undefined;
                    } & {
                        bitarray?: ({
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } & {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                        mode_infos?: (any[] & ({
                            single?: {
                                mode?: SignMode | undefined;
                            } | undefined;
                            multi?: {
                                bitarray?: {
                                    extra_bits_stored?: number | undefined;
                                    elems?: Uint8Array | undefined;
                                } | undefined;
                                mode_infos?: any[] | undefined;
                            } | undefined;
                        } & {
                            single?: ({
                                mode?: SignMode | undefined;
                            } & {
                                mode?: SignMode | undefined;
                            } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                            multi?: ({
                                bitarray?: {
                                    extra_bits_stored?: number | undefined;
                                    elems?: Uint8Array | undefined;
                                } | undefined;
                                mode_infos?: any[] | undefined;
                            } & {
                                bitarray?: ({
                                    extra_bits_stored?: number | undefined;
                                    elems?: Uint8Array | undefined;
                                } & {
                                    extra_bits_stored?: number | undefined;
                                    elems?: Uint8Array | undefined;
                                } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                                mode_infos?: (any[] & ({
                                    single?: {
                                        mode?: SignMode | undefined;
                                    } | undefined;
                                    multi?: {
                                        bitarray?: {
                                            extra_bits_stored?: number | undefined;
                                            elems?: Uint8Array | undefined;
                                        } | undefined;
                                        mode_infos?: any[] | undefined;
                                    } | undefined;
                                } & {
                                    single?: ({
                                        mode?: SignMode | undefined;
                                    } & {
                                        mode?: SignMode | undefined;
                                    } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                                    multi?: ({
                                        bitarray?: {
                                            extra_bits_stored?: number | undefined;
                                            elems?: Uint8Array | undefined;
                                        } | undefined;
                                        mode_infos?: any[] | undefined;
                                    } & {
                                        bitarray?: ({
                                            extra_bits_stored?: number | undefined;
                                            elems?: Uint8Array | undefined;
                                        } & {
                                            extra_bits_stored?: number | undefined;
                                            elems?: Uint8Array | undefined;
                                        } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                                        mode_infos?: (any[] & ({
                                            single?: {
                                                mode?: SignMode | undefined;
                                            } | undefined;
                                            multi?: {
                                                bitarray?: {
                                                    extra_bits_stored?: number | undefined;
                                                    elems?: Uint8Array | undefined;
                                                } | undefined;
                                                mode_infos?: any[] | undefined;
                                            } | undefined;
                                        } & {
                                            single?: ({
                                                mode?: SignMode | undefined;
                                            } & {
                                                mode?: SignMode | undefined;
                                            } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                                            multi?: ({
                                                bitarray?: {
                                                    extra_bits_stored?: number | undefined;
                                                    elems?: Uint8Array | undefined;
                                                } | undefined;
                                                mode_infos?: any[] | undefined;
                                            } & {
                                                bitarray?: ({
                                                    extra_bits_stored?: number | undefined;
                                                    elems?: Uint8Array | undefined;
                                                } & any & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                                                mode_infos?: (any[] & ({
                                                    single?: {
                                                        mode?: SignMode | undefined;
                                                    } | undefined;
                                                    multi?: {
                                                        bitarray?: {
                                                            extra_bits_stored?: number | undefined;
                                                            elems?: Uint8Array | undefined;
                                                        } | undefined;
                                                        mode_infos?: any[] | undefined;
                                                    } | undefined;
                                                } & any & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                                            } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                                        } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                                    } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                                } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                            } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                        } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                    } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number]["mode_info"], keyof ModeInfo>, never>) | undefined;
                sequence?: string | undefined;
            } & Record<Exclude<keyof I["auth_info"]["signer_infos"][number], keyof SignerInfo>, never>)[] & Record<Exclude<keyof I["auth_info"]["signer_infos"], keyof {
                public_key?: {
                    type_url?: string | undefined;
                    value?: Uint8Array | undefined;
                } | undefined;
                mode_info?: {
                    single?: {
                        mode?: SignMode | undefined;
                    } | undefined;
                    multi?: {
                        bitarray?: {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } | undefined;
                        mode_infos?: any[] | undefined;
                    } | undefined;
                } | undefined;
                sequence?: string | undefined;
            }[]>, never>) | undefined;
            fee?: ({
                amount?: {
                    denom?: string | undefined;
                    amount?: string | undefined;
                }[] | undefined;
                gas_limit?: string | undefined;
                payer?: string | undefined;
                granter?: string | undefined;
            } & {
                amount?: ({
                    denom?: string | undefined;
                    amount?: string | undefined;
                }[] & ({
                    denom?: string | undefined;
                    amount?: string | undefined;
                } & {
                    denom?: string | undefined;
                    amount?: string | undefined;
                } & Record<Exclude<keyof I["auth_info"]["fee"]["amount"][number], keyof Coin>, never>)[] & Record<Exclude<keyof I["auth_info"]["fee"]["amount"], keyof {
                    denom?: string | undefined;
                    amount?: string | undefined;
                }[]>, never>) | undefined;
                gas_limit?: string | undefined;
                payer?: string | undefined;
                granter?: string | undefined;
            } & Record<Exclude<keyof I["auth_info"]["fee"], keyof Fee>, never>) | undefined;
        } & Record<Exclude<keyof I["auth_info"], keyof AuthInfo>, never>) | undefined;
        signatures?: (Uint8Array[] & Uint8Array[] & Record<Exclude<keyof I["signatures"], keyof Uint8Array[]>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof Tx>, never>>(object: I): Tx;
};
export declare const TxRaw: {
    encode(message: TxRaw, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): TxRaw;
    fromJSON(object: any): TxRaw;
    toJSON(message: TxRaw): unknown;
    fromPartial<I extends {
        body_bytes?: Uint8Array | undefined;
        auth_info_bytes?: Uint8Array | undefined;
        signatures?: Uint8Array[] | undefined;
    } & {
        body_bytes?: Uint8Array | undefined;
        auth_info_bytes?: Uint8Array | undefined;
        signatures?: (Uint8Array[] & Uint8Array[] & Record<Exclude<keyof I["signatures"], keyof Uint8Array[]>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof TxRaw>, never>>(object: I): TxRaw;
};
export declare const SignDoc: {
    encode(message: SignDoc, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): SignDoc;
    fromJSON(object: any): SignDoc;
    toJSON(message: SignDoc): unknown;
    fromPartial<I extends {
        body_bytes?: Uint8Array | undefined;
        auth_info_bytes?: Uint8Array | undefined;
        chain_id?: string | undefined;
        account_number?: string | undefined;
    } & {
        body_bytes?: Uint8Array | undefined;
        auth_info_bytes?: Uint8Array | undefined;
        chain_id?: string | undefined;
        account_number?: string | undefined;
    } & Record<Exclude<keyof I, keyof SignDoc>, never>>(object: I): SignDoc;
};
export declare const TxBody: {
    encode(message: TxBody, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): TxBody;
    fromJSON(object: any): TxBody;
    toJSON(message: TxBody): unknown;
    fromPartial<I extends {
        messages?: {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        }[] | undefined;
        memo?: string | undefined;
        timeout_height?: string | undefined;
        extension_options?: {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        }[] | undefined;
        non_critical_extension_options?: {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        }[] | undefined;
    } & {
        messages?: ({
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        }[] & ({
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["messages"][number], keyof Any>, never>)[] & Record<Exclude<keyof I["messages"], keyof {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        }[]>, never>) | undefined;
        memo?: string | undefined;
        timeout_height?: string | undefined;
        extension_options?: ({
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        }[] & ({
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["extension_options"][number], keyof Any>, never>)[] & Record<Exclude<keyof I["extension_options"], keyof {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        }[]>, never>) | undefined;
        non_critical_extension_options?: ({
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        }[] & ({
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["non_critical_extension_options"][number], keyof Any>, never>)[] & Record<Exclude<keyof I["non_critical_extension_options"], keyof {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        }[]>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof TxBody>, never>>(object: I): TxBody;
};
export declare const AuthInfo: {
    encode(message: AuthInfo, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): AuthInfo;
    fromJSON(object: any): AuthInfo;
    toJSON(message: AuthInfo): unknown;
    fromPartial<I extends {
        signer_infos?: {
            public_key?: {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            } | undefined;
            mode_info?: {
                single?: {
                    mode?: SignMode | undefined;
                } | undefined;
                multi?: {
                    bitarray?: {
                        extra_bits_stored?: number | undefined;
                        elems?: Uint8Array | undefined;
                    } | undefined;
                    mode_infos?: any[] | undefined;
                } | undefined;
            } | undefined;
            sequence?: string | undefined;
        }[] | undefined;
        fee?: {
            amount?: {
                denom?: string | undefined;
                amount?: string | undefined;
            }[] | undefined;
            gas_limit?: string | undefined;
            payer?: string | undefined;
            granter?: string | undefined;
        } | undefined;
    } & {
        signer_infos?: ({
            public_key?: {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            } | undefined;
            mode_info?: {
                single?: {
                    mode?: SignMode | undefined;
                } | undefined;
                multi?: {
                    bitarray?: {
                        extra_bits_stored?: number | undefined;
                        elems?: Uint8Array | undefined;
                    } | undefined;
                    mode_infos?: any[] | undefined;
                } | undefined;
            } | undefined;
            sequence?: string | undefined;
        }[] & ({
            public_key?: {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            } | undefined;
            mode_info?: {
                single?: {
                    mode?: SignMode | undefined;
                } | undefined;
                multi?: {
                    bitarray?: {
                        extra_bits_stored?: number | undefined;
                        elems?: Uint8Array | undefined;
                    } | undefined;
                    mode_infos?: any[] | undefined;
                } | undefined;
            } | undefined;
            sequence?: string | undefined;
        } & {
            public_key?: ({
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            } & {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["signer_infos"][number]["public_key"], keyof Any>, never>) | undefined;
            mode_info?: ({
                single?: {
                    mode?: SignMode | undefined;
                } | undefined;
                multi?: {
                    bitarray?: {
                        extra_bits_stored?: number | undefined;
                        elems?: Uint8Array | undefined;
                    } | undefined;
                    mode_infos?: any[] | undefined;
                } | undefined;
            } & {
                single?: ({
                    mode?: SignMode | undefined;
                } & {
                    mode?: SignMode | undefined;
                } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["single"], "mode">, never>) | undefined;
                multi?: ({
                    bitarray?: {
                        extra_bits_stored?: number | undefined;
                        elems?: Uint8Array | undefined;
                    } | undefined;
                    mode_infos?: any[] | undefined;
                } & {
                    bitarray?: ({
                        extra_bits_stored?: number | undefined;
                        elems?: Uint8Array | undefined;
                    } & {
                        extra_bits_stored?: number | undefined;
                        elems?: Uint8Array | undefined;
                    } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                    mode_infos?: (any[] & ({
                        single?: {
                            mode?: SignMode | undefined;
                        } | undefined;
                        multi?: {
                            bitarray?: {
                                extra_bits_stored?: number | undefined;
                                elems?: Uint8Array | undefined;
                            } | undefined;
                            mode_infos?: any[] | undefined;
                        } | undefined;
                    } & {
                        single?: ({
                            mode?: SignMode | undefined;
                        } & {
                            mode?: SignMode | undefined;
                        } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                        multi?: ({
                            bitarray?: {
                                extra_bits_stored?: number | undefined;
                                elems?: Uint8Array | undefined;
                            } | undefined;
                            mode_infos?: any[] | undefined;
                        } & {
                            bitarray?: ({
                                extra_bits_stored?: number | undefined;
                                elems?: Uint8Array | undefined;
                            } & {
                                extra_bits_stored?: number | undefined;
                                elems?: Uint8Array | undefined;
                            } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                            mode_infos?: (any[] & ({
                                single?: {
                                    mode?: SignMode | undefined;
                                } | undefined;
                                multi?: {
                                    bitarray?: {
                                        extra_bits_stored?: number | undefined;
                                        elems?: Uint8Array | undefined;
                                    } | undefined;
                                    mode_infos?: any[] | undefined;
                                } | undefined;
                            } & {
                                single?: ({
                                    mode?: SignMode | undefined;
                                } & {
                                    mode?: SignMode | undefined;
                                } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                                multi?: ({
                                    bitarray?: {
                                        extra_bits_stored?: number | undefined;
                                        elems?: Uint8Array | undefined;
                                    } | undefined;
                                    mode_infos?: any[] | undefined;
                                } & {
                                    bitarray?: ({
                                        extra_bits_stored?: number | undefined;
                                        elems?: Uint8Array | undefined;
                                    } & {
                                        extra_bits_stored?: number | undefined;
                                        elems?: Uint8Array | undefined;
                                    } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                                    mode_infos?: (any[] & ({
                                        single?: {
                                            mode?: SignMode | undefined;
                                        } | undefined;
                                        multi?: {
                                            bitarray?: {
                                                extra_bits_stored?: number | undefined;
                                                elems?: Uint8Array | undefined;
                                            } | undefined;
                                            mode_infos?: any[] | undefined;
                                        } | undefined;
                                    } & {
                                        single?: ({
                                            mode?: SignMode | undefined;
                                        } & {
                                            mode?: SignMode | undefined;
                                        } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                                        multi?: ({
                                            bitarray?: {
                                                extra_bits_stored?: number | undefined;
                                                elems?: Uint8Array | undefined;
                                            } | undefined;
                                            mode_infos?: any[] | undefined;
                                        } & {
                                            bitarray?: ({
                                                extra_bits_stored?: number | undefined;
                                                elems?: Uint8Array | undefined;
                                            } & {
                                                extra_bits_stored?: number | undefined;
                                                elems?: Uint8Array | undefined;
                                            } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                                            mode_infos?: (any[] & ({
                                                single?: {
                                                    mode?: SignMode | undefined;
                                                } | undefined;
                                                multi?: {
                                                    bitarray?: {
                                                        extra_bits_stored?: number | undefined;
                                                        elems?: Uint8Array | undefined;
                                                    } | undefined;
                                                    mode_infos?: any[] | undefined;
                                                } | undefined;
                                            } & {
                                                single?: ({
                                                    mode?: SignMode | undefined;
                                                } & any & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                                                multi?: ({
                                                    bitarray?: {
                                                        extra_bits_stored?: number | undefined;
                                                        elems?: Uint8Array | undefined;
                                                    } | undefined;
                                                    mode_infos?: any[] | undefined;
                                                } & any & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                                            } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                                        } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                                    } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                                } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                            } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                        } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                    } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
            } & Record<Exclude<keyof I["signer_infos"][number]["mode_info"], keyof ModeInfo>, never>) | undefined;
            sequence?: string | undefined;
        } & Record<Exclude<keyof I["signer_infos"][number], keyof SignerInfo>, never>)[] & Record<Exclude<keyof I["signer_infos"], keyof {
            public_key?: {
                type_url?: string | undefined;
                value?: Uint8Array | undefined;
            } | undefined;
            mode_info?: {
                single?: {
                    mode?: SignMode | undefined;
                } | undefined;
                multi?: {
                    bitarray?: {
                        extra_bits_stored?: number | undefined;
                        elems?: Uint8Array | undefined;
                    } | undefined;
                    mode_infos?: any[] | undefined;
                } | undefined;
            } | undefined;
            sequence?: string | undefined;
        }[]>, never>) | undefined;
        fee?: ({
            amount?: {
                denom?: string | undefined;
                amount?: string | undefined;
            }[] | undefined;
            gas_limit?: string | undefined;
            payer?: string | undefined;
            granter?: string | undefined;
        } & {
            amount?: ({
                denom?: string | undefined;
                amount?: string | undefined;
            }[] & ({
                denom?: string | undefined;
                amount?: string | undefined;
            } & {
                denom?: string | undefined;
                amount?: string | undefined;
            } & Record<Exclude<keyof I["fee"]["amount"][number], keyof Coin>, never>)[] & Record<Exclude<keyof I["fee"]["amount"], keyof {
                denom?: string | undefined;
                amount?: string | undefined;
            }[]>, never>) | undefined;
            gas_limit?: string | undefined;
            payer?: string | undefined;
            granter?: string | undefined;
        } & Record<Exclude<keyof I["fee"], keyof Fee>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof AuthInfo>, never>>(object: I): AuthInfo;
};
export declare const SignerInfo: {
    encode(message: SignerInfo, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): SignerInfo;
    fromJSON(object: any): SignerInfo;
    toJSON(message: SignerInfo): unknown;
    fromPartial<I extends {
        public_key?: {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } | undefined;
        mode_info?: {
            single?: {
                mode?: SignMode | undefined;
            } | undefined;
            multi?: {
                bitarray?: {
                    extra_bits_stored?: number | undefined;
                    elems?: Uint8Array | undefined;
                } | undefined;
                mode_infos?: any[] | undefined;
            } | undefined;
        } | undefined;
        sequence?: string | undefined;
    } & {
        public_key?: ({
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & {
            type_url?: string | undefined;
            value?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["public_key"], keyof Any>, never>) | undefined;
        mode_info?: ({
            single?: {
                mode?: SignMode | undefined;
            } | undefined;
            multi?: {
                bitarray?: {
                    extra_bits_stored?: number | undefined;
                    elems?: Uint8Array | undefined;
                } | undefined;
                mode_infos?: any[] | undefined;
            } | undefined;
        } & {
            single?: ({
                mode?: SignMode | undefined;
            } & {
                mode?: SignMode | undefined;
            } & Record<Exclude<keyof I["mode_info"]["single"], "mode">, never>) | undefined;
            multi?: ({
                bitarray?: {
                    extra_bits_stored?: number | undefined;
                    elems?: Uint8Array | undefined;
                } | undefined;
                mode_infos?: any[] | undefined;
            } & {
                bitarray?: ({
                    extra_bits_stored?: number | undefined;
                    elems?: Uint8Array | undefined;
                } & {
                    extra_bits_stored?: number | undefined;
                    elems?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["mode_info"]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                mode_infos?: (any[] & ({
                    single?: {
                        mode?: SignMode | undefined;
                    } | undefined;
                    multi?: {
                        bitarray?: {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } | undefined;
                        mode_infos?: any[] | undefined;
                    } | undefined;
                } & {
                    single?: ({
                        mode?: SignMode | undefined;
                    } & {
                        mode?: SignMode | undefined;
                    } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                    multi?: ({
                        bitarray?: {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } | undefined;
                        mode_infos?: any[] | undefined;
                    } & {
                        bitarray?: ({
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } & {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                        mode_infos?: (any[] & ({
                            single?: {
                                mode?: SignMode | undefined;
                            } | undefined;
                            multi?: {
                                bitarray?: {
                                    extra_bits_stored?: number | undefined;
                                    elems?: Uint8Array | undefined;
                                } | undefined;
                                mode_infos?: any[] | undefined;
                            } | undefined;
                        } & {
                            single?: ({
                                mode?: SignMode | undefined;
                            } & {
                                mode?: SignMode | undefined;
                            } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                            multi?: ({
                                bitarray?: {
                                    extra_bits_stored?: number | undefined;
                                    elems?: Uint8Array | undefined;
                                } | undefined;
                                mode_infos?: any[] | undefined;
                            } & {
                                bitarray?: ({
                                    extra_bits_stored?: number | undefined;
                                    elems?: Uint8Array | undefined;
                                } & {
                                    extra_bits_stored?: number | undefined;
                                    elems?: Uint8Array | undefined;
                                } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                                mode_infos?: (any[] & ({
                                    single?: {
                                        mode?: SignMode | undefined;
                                    } | undefined;
                                    multi?: {
                                        bitarray?: {
                                            extra_bits_stored?: number | undefined;
                                            elems?: Uint8Array | undefined;
                                        } | undefined;
                                        mode_infos?: any[] | undefined;
                                    } | undefined;
                                } & {
                                    single?: ({
                                        mode?: SignMode | undefined;
                                    } & {
                                        mode?: SignMode | undefined;
                                    } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                                    multi?: ({
                                        bitarray?: {
                                            extra_bits_stored?: number | undefined;
                                            elems?: Uint8Array | undefined;
                                        } | undefined;
                                        mode_infos?: any[] | undefined;
                                    } & {
                                        bitarray?: ({
                                            extra_bits_stored?: number | undefined;
                                            elems?: Uint8Array | undefined;
                                        } & {
                                            extra_bits_stored?: number | undefined;
                                            elems?: Uint8Array | undefined;
                                        } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                                        mode_infos?: (any[] & ({
                                            single?: {
                                                mode?: SignMode | undefined;
                                            } | undefined;
                                            multi?: {
                                                bitarray?: {
                                                    extra_bits_stored?: number | undefined;
                                                    elems?: Uint8Array | undefined;
                                                } | undefined;
                                                mode_infos?: any[] | undefined;
                                            } | undefined;
                                        } & {
                                            single?: ({
                                                mode?: SignMode | undefined;
                                            } & {
                                                mode?: SignMode | undefined;
                                            } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                                            multi?: ({
                                                bitarray?: {
                                                    extra_bits_stored?: number | undefined;
                                                    elems?: Uint8Array | undefined;
                                                } | undefined;
                                                mode_infos?: any[] | undefined;
                                            } & {
                                                bitarray?: ({
                                                    extra_bits_stored?: number | undefined;
                                                    elems?: Uint8Array | undefined;
                                                } & any & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                                                mode_infos?: (any[] & ({
                                                    single?: {
                                                        mode?: SignMode | undefined;
                                                    } | undefined;
                                                    multi?: {
                                                        bitarray?: {
                                                            extra_bits_stored?: number | undefined;
                                                            elems?: Uint8Array | undefined;
                                                        } | undefined;
                                                        mode_infos?: any[] | undefined;
                                                    } | undefined;
                                                } & any & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                                            } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                                        } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                                    } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                                } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                            } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                        } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                    } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                } & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["mode_info"]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
            } & Record<Exclude<keyof I["mode_info"]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
        } & Record<Exclude<keyof I["mode_info"], keyof ModeInfo>, never>) | undefined;
        sequence?: string | undefined;
    } & Record<Exclude<keyof I, keyof SignerInfo>, never>>(object: I): SignerInfo;
};
export declare const ModeInfo: {
    encode(message: ModeInfo, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): ModeInfo;
    fromJSON(object: any): ModeInfo;
    toJSON(message: ModeInfo): unknown;
    fromPartial<I extends {
        single?: {
            mode?: SignMode | undefined;
        } | undefined;
        multi?: {
            bitarray?: {
                extra_bits_stored?: number | undefined;
                elems?: Uint8Array | undefined;
            } | undefined;
            mode_infos?: any[] | undefined;
        } | undefined;
    } & {
        single?: ({
            mode?: SignMode | undefined;
        } & {
            mode?: SignMode | undefined;
        } & Record<Exclude<keyof I["single"], "mode">, never>) | undefined;
        multi?: ({
            bitarray?: {
                extra_bits_stored?: number | undefined;
                elems?: Uint8Array | undefined;
            } | undefined;
            mode_infos?: any[] | undefined;
        } & {
            bitarray?: ({
                extra_bits_stored?: number | undefined;
                elems?: Uint8Array | undefined;
            } & {
                extra_bits_stored?: number | undefined;
                elems?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
            mode_infos?: (any[] & ({
                single?: {
                    mode?: SignMode | undefined;
                } | undefined;
                multi?: {
                    bitarray?: {
                        extra_bits_stored?: number | undefined;
                        elems?: Uint8Array | undefined;
                    } | undefined;
                    mode_infos?: any[] | undefined;
                } | undefined;
            } & {
                single?: ({
                    mode?: SignMode | undefined;
                } & {
                    mode?: SignMode | undefined;
                } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                multi?: ({
                    bitarray?: {
                        extra_bits_stored?: number | undefined;
                        elems?: Uint8Array | undefined;
                    } | undefined;
                    mode_infos?: any[] | undefined;
                } & {
                    bitarray?: ({
                        extra_bits_stored?: number | undefined;
                        elems?: Uint8Array | undefined;
                    } & {
                        extra_bits_stored?: number | undefined;
                        elems?: Uint8Array | undefined;
                    } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                    mode_infos?: (any[] & ({
                        single?: {
                            mode?: SignMode | undefined;
                        } | undefined;
                        multi?: {
                            bitarray?: {
                                extra_bits_stored?: number | undefined;
                                elems?: Uint8Array | undefined;
                            } | undefined;
                            mode_infos?: any[] | undefined;
                        } | undefined;
                    } & {
                        single?: ({
                            mode?: SignMode | undefined;
                        } & {
                            mode?: SignMode | undefined;
                        } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                        multi?: ({
                            bitarray?: {
                                extra_bits_stored?: number | undefined;
                                elems?: Uint8Array | undefined;
                            } | undefined;
                            mode_infos?: any[] | undefined;
                        } & {
                            bitarray?: ({
                                extra_bits_stored?: number | undefined;
                                elems?: Uint8Array | undefined;
                            } & {
                                extra_bits_stored?: number | undefined;
                                elems?: Uint8Array | undefined;
                            } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                            mode_infos?: (any[] & ({
                                single?: {
                                    mode?: SignMode | undefined;
                                } | undefined;
                                multi?: {
                                    bitarray?: {
                                        extra_bits_stored?: number | undefined;
                                        elems?: Uint8Array | undefined;
                                    } | undefined;
                                    mode_infos?: any[] | undefined;
                                } | undefined;
                            } & {
                                single?: ({
                                    mode?: SignMode | undefined;
                                } & {
                                    mode?: SignMode | undefined;
                                } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                                multi?: ({
                                    bitarray?: {
                                        extra_bits_stored?: number | undefined;
                                        elems?: Uint8Array | undefined;
                                    } | undefined;
                                    mode_infos?: any[] | undefined;
                                } & {
                                    bitarray?: ({
                                        extra_bits_stored?: number | undefined;
                                        elems?: Uint8Array | undefined;
                                    } & {
                                        extra_bits_stored?: number | undefined;
                                        elems?: Uint8Array | undefined;
                                    } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                                    mode_infos?: (any[] & ({
                                        single?: {
                                            mode?: SignMode | undefined;
                                        } | undefined;
                                        multi?: {
                                            bitarray?: {
                                                extra_bits_stored?: number | undefined;
                                                elems?: Uint8Array | undefined;
                                            } | undefined;
                                            mode_infos?: any[] | undefined;
                                        } | undefined;
                                    } & {
                                        single?: ({
                                            mode?: SignMode | undefined;
                                        } & {
                                            mode?: SignMode | undefined;
                                        } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                                        multi?: ({
                                            bitarray?: {
                                                extra_bits_stored?: number | undefined;
                                                elems?: Uint8Array | undefined;
                                            } | undefined;
                                            mode_infos?: any[] | undefined;
                                        } & {
                                            bitarray?: ({
                                                extra_bits_stored?: number | undefined;
                                                elems?: Uint8Array | undefined;
                                            } & {
                                                extra_bits_stored?: number | undefined;
                                                elems?: Uint8Array | undefined;
                                            } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                                            mode_infos?: (any[] & ({
                                                single?: {
                                                    mode?: SignMode | undefined;
                                                } | undefined;
                                                multi?: {
                                                    bitarray?: {
                                                        extra_bits_stored?: number | undefined;
                                                        elems?: Uint8Array | undefined;
                                                    } | undefined;
                                                    mode_infos?: any[] | undefined;
                                                } | undefined;
                                            } & {
                                                single?: ({
                                                    mode?: SignMode | undefined;
                                                } & any & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                                                multi?: ({
                                                    bitarray?: {
                                                        extra_bits_stored?: number | undefined;
                                                        elems?: Uint8Array | undefined;
                                                    } | undefined;
                                                    mode_infos?: any[] | undefined;
                                                } & any & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                                            } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                                        } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                                    } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                                } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                            } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                        } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                    } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                } & Record<Exclude<keyof I["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
            } & Record<Exclude<keyof I["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
        } & Record<Exclude<keyof I["multi"], keyof ModeInfo_Multi>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof ModeInfo>, never>>(object: I): ModeInfo;
};
export declare const ModeInfo_Single: {
    encode(message: ModeInfo_Single, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): ModeInfo_Single;
    fromJSON(object: any): ModeInfo_Single;
    toJSON(message: ModeInfo_Single): unknown;
    fromPartial<I extends {
        mode?: SignMode | undefined;
    } & {
        mode?: SignMode | undefined;
    } & Record<Exclude<keyof I, "mode">, never>>(object: I): ModeInfo_Single;
};
export declare const ModeInfo_Multi: {
    encode(message: ModeInfo_Multi, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): ModeInfo_Multi;
    fromJSON(object: any): ModeInfo_Multi;
    toJSON(message: ModeInfo_Multi): unknown;
    fromPartial<I extends {
        bitarray?: {
            extra_bits_stored?: number | undefined;
            elems?: Uint8Array | undefined;
        } | undefined;
        mode_infos?: any[] | undefined;
    } & {
        bitarray?: ({
            extra_bits_stored?: number | undefined;
            elems?: Uint8Array | undefined;
        } & {
            extra_bits_stored?: number | undefined;
            elems?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["bitarray"], keyof CompactBitArray>, never>) | undefined;
        mode_infos?: (any[] & ({
            single?: {
                mode?: SignMode | undefined;
            } | undefined;
            multi?: {
                bitarray?: {
                    extra_bits_stored?: number | undefined;
                    elems?: Uint8Array | undefined;
                } | undefined;
                mode_infos?: any[] | undefined;
            } | undefined;
        } & {
            single?: ({
                mode?: SignMode | undefined;
            } & {
                mode?: SignMode | undefined;
            } & Record<Exclude<keyof I["mode_infos"][number]["single"], "mode">, never>) | undefined;
            multi?: ({
                bitarray?: {
                    extra_bits_stored?: number | undefined;
                    elems?: Uint8Array | undefined;
                } | undefined;
                mode_infos?: any[] | undefined;
            } & {
                bitarray?: ({
                    extra_bits_stored?: number | undefined;
                    elems?: Uint8Array | undefined;
                } & {
                    extra_bits_stored?: number | undefined;
                    elems?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                mode_infos?: (any[] & ({
                    single?: {
                        mode?: SignMode | undefined;
                    } | undefined;
                    multi?: {
                        bitarray?: {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } | undefined;
                        mode_infos?: any[] | undefined;
                    } | undefined;
                } & {
                    single?: ({
                        mode?: SignMode | undefined;
                    } & {
                        mode?: SignMode | undefined;
                    } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                    multi?: ({
                        bitarray?: {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } | undefined;
                        mode_infos?: any[] | undefined;
                    } & {
                        bitarray?: ({
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } & {
                            extra_bits_stored?: number | undefined;
                            elems?: Uint8Array | undefined;
                        } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                        mode_infos?: (any[] & ({
                            single?: {
                                mode?: SignMode | undefined;
                            } | undefined;
                            multi?: {
                                bitarray?: {
                                    extra_bits_stored?: number | undefined;
                                    elems?: Uint8Array | undefined;
                                } | undefined;
                                mode_infos?: any[] | undefined;
                            } | undefined;
                        } & {
                            single?: ({
                                mode?: SignMode | undefined;
                            } & {
                                mode?: SignMode | undefined;
                            } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                            multi?: ({
                                bitarray?: {
                                    extra_bits_stored?: number | undefined;
                                    elems?: Uint8Array | undefined;
                                } | undefined;
                                mode_infos?: any[] | undefined;
                            } & {
                                bitarray?: ({
                                    extra_bits_stored?: number | undefined;
                                    elems?: Uint8Array | undefined;
                                } & {
                                    extra_bits_stored?: number | undefined;
                                    elems?: Uint8Array | undefined;
                                } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                                mode_infos?: (any[] & ({
                                    single?: {
                                        mode?: SignMode | undefined;
                                    } | undefined;
                                    multi?: {
                                        bitarray?: {
                                            extra_bits_stored?: number | undefined;
                                            elems?: Uint8Array | undefined;
                                        } | undefined;
                                        mode_infos?: any[] | undefined;
                                    } | undefined;
                                } & {
                                    single?: ({
                                        mode?: SignMode | undefined;
                                    } & {
                                        mode?: SignMode | undefined;
                                    } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                                    multi?: ({
                                        bitarray?: {
                                            extra_bits_stored?: number | undefined;
                                            elems?: Uint8Array | undefined;
                                        } | undefined;
                                        mode_infos?: any[] | undefined;
                                    } & {
                                        bitarray?: ({
                                            extra_bits_stored?: number | undefined;
                                            elems?: Uint8Array | undefined;
                                        } & {
                                            extra_bits_stored?: number | undefined;
                                            elems?: Uint8Array | undefined;
                                        } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                                        mode_infos?: (any[] & ({
                                            single?: {
                                                mode?: SignMode | undefined;
                                            } | undefined;
                                            multi?: {
                                                bitarray?: {
                                                    extra_bits_stored?: number | undefined;
                                                    elems?: Uint8Array | undefined;
                                                } | undefined;
                                                mode_infos?: any[] | undefined;
                                            } | undefined;
                                        } & {
                                            single?: ({
                                                mode?: SignMode | undefined;
                                            } & {
                                                mode?: SignMode | undefined;
                                            } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["single"], "mode">, never>) | undefined;
                                            multi?: ({
                                                bitarray?: {
                                                    extra_bits_stored?: number | undefined;
                                                    elems?: Uint8Array | undefined;
                                                } | undefined;
                                                mode_infos?: any[] | undefined;
                                            } & {
                                                bitarray?: ({
                                                    extra_bits_stored?: number | undefined;
                                                    elems?: Uint8Array | undefined;
                                                } & any & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["bitarray"], keyof CompactBitArray>, never>) | undefined;
                                                mode_infos?: (any[] & ({
                                                    single?: {
                                                        mode?: SignMode | undefined;
                                                    } | undefined;
                                                    multi?: {
                                                        bitarray?: {
                                                            extra_bits_stored?: number | undefined;
                                                            elems?: Uint8Array | undefined;
                                                        } | undefined;
                                                        mode_infos?: any[] | undefined;
                                                    } | undefined;
                                                } & any & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                                            } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                                        } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                                    } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                                } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                            } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                        } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
                    } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
                } & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["mode_infos"][number]["multi"]["mode_infos"], keyof any[]>, never>) | undefined;
            } & Record<Exclude<keyof I["mode_infos"][number]["multi"], keyof ModeInfo_Multi>, never>) | undefined;
        } & Record<Exclude<keyof I["mode_infos"][number], keyof ModeInfo>, never>)[] & Record<Exclude<keyof I["mode_infos"], keyof any[]>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof ModeInfo_Multi>, never>>(object: I): ModeInfo_Multi;
};
export declare const Fee: {
    encode(message: Fee, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): Fee;
    fromJSON(object: any): Fee;
    toJSON(message: Fee): unknown;
    fromPartial<I extends {
        amount?: {
            denom?: string | undefined;
            amount?: string | undefined;
        }[] | undefined;
        gas_limit?: string | undefined;
        payer?: string | undefined;
        granter?: string | undefined;
    } & {
        amount?: ({
            denom?: string | undefined;
            amount?: string | undefined;
        }[] & ({
            denom?: string | undefined;
            amount?: string | undefined;
        } & {
            denom?: string | undefined;
            amount?: string | undefined;
        } & Record<Exclude<keyof I["amount"][number], keyof Coin>, never>)[] & Record<Exclude<keyof I["amount"], keyof {
            denom?: string | undefined;
            amount?: string | undefined;
        }[]>, never>) | undefined;
        gas_limit?: string | undefined;
        payer?: string | undefined;
        granter?: string | undefined;
    } & Record<Exclude<keyof I, keyof Fee>, never>>(object: I): Fee;
};
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