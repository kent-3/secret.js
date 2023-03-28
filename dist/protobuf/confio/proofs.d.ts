import * as _m0 from "protobufjs/minimal";
export declare const protobufPackage = "ics23";
export declare enum HashOp {
    /** NO_HASH - NO_HASH is the default if no data passed. Note this is an illegal argument some places. */
    NO_HASH = 0,
    SHA256 = 1,
    SHA512 = 2,
    KECCAK = 3,
    RIPEMD160 = 4,
    /** BITCOIN - ripemd160(sha256(x)) */
    BITCOIN = 5,
    UNRECOGNIZED = -1
}
export declare function hashOpFromJSON(object: any): HashOp;
export declare function hashOpToJSON(object: HashOp): string;
/**
 * LengthOp defines how to process the key and value of the LeafOp
 * to include length information. After encoding the length with the given
 * algorithm, the length will be prepended to the key and value bytes.
 * (Each one with it's own encoded length)
 */
export declare enum LengthOp {
    /** NO_PREFIX - NO_PREFIX don't include any length info */
    NO_PREFIX = 0,
    /** VAR_PROTO - VAR_PROTO uses protobuf (and go-amino) varint encoding of the length */
    VAR_PROTO = 1,
    /** VAR_RLP - VAR_RLP uses rlp int encoding of the length */
    VAR_RLP = 2,
    /** FIXED32_BIG - FIXED32_BIG uses big-endian encoding of the length as a 32 bit integer */
    FIXED32_BIG = 3,
    /** FIXED32_LITTLE - FIXED32_LITTLE uses little-endian encoding of the length as a 32 bit integer */
    FIXED32_LITTLE = 4,
    /** FIXED64_BIG - FIXED64_BIG uses big-endian encoding of the length as a 64 bit integer */
    FIXED64_BIG = 5,
    /** FIXED64_LITTLE - FIXED64_LITTLE uses little-endian encoding of the length as a 64 bit integer */
    FIXED64_LITTLE = 6,
    /** REQUIRE_32_BYTES - REQUIRE_32_BYTES is like NONE, but will fail if the input is not exactly 32 bytes (sha256 output) */
    REQUIRE_32_BYTES = 7,
    /** REQUIRE_64_BYTES - REQUIRE_64_BYTES is like NONE, but will fail if the input is not exactly 64 bytes (sha512 output) */
    REQUIRE_64_BYTES = 8,
    UNRECOGNIZED = -1
}
export declare function lengthOpFromJSON(object: any): LengthOp;
export declare function lengthOpToJSON(object: LengthOp): string;
/**
 * ExistenceProof takes a key and a value and a set of steps to perform on it.
 * The result of peforming all these steps will provide a "root hash", which can
 * be compared to the value in a header.
 *
 * Since it is computationally infeasible to produce a hash collission for any of the used
 * cryptographic hash functions, if someone can provide a series of operations to transform
 * a given key and value into a root hash that matches some trusted root, these key and values
 * must be in the referenced merkle tree.
 *
 * The only possible issue is maliablity in LeafOp, such as providing extra prefix data,
 * which should be controlled by a spec. Eg. with lengthOp as NONE,
 * prefix = FOO, key = BAR, value = CHOICE
 * and
 * prefix = F, key = OOBAR, value = CHOICE
 * would produce the same value.
 *
 * With LengthOp this is tricker but not impossible. Which is why the "leafPrefixEqual" field
 * in the ProofSpec is valuable to prevent this mutability. And why all trees should
 * length-prefix the data before hashing it.
 */
export interface ExistenceProof {
    key: Uint8Array;
    value: Uint8Array;
    leaf?: LeafOp;
    path: InnerOp[];
}
/**
 * NonExistenceProof takes a proof of two neighbors, one left of the desired key,
 * one right of the desired key. If both proofs are valid AND they are neighbors,
 * then there is no valid proof for the given key.
 */
export interface NonExistenceProof {
    /** TODO: remove this as unnecessary??? we prove a range */
    key: Uint8Array;
    left?: ExistenceProof;
    right?: ExistenceProof;
}
/** CommitmentProof is either an ExistenceProof or a NonExistenceProof, or a Batch of such messages */
export interface CommitmentProof {
    exist?: ExistenceProof | undefined;
    nonexist?: NonExistenceProof | undefined;
    batch?: BatchProof | undefined;
    compressed?: CompressedBatchProof | undefined;
}
/**
 * LeafOp represents the raw key-value data we wish to prove, and
 * must be flexible to represent the internal transformation from
 * the original key-value pairs into the basis hash, for many existing
 * merkle trees.
 *
 * key and value are passed in. So that the signature of this operation is:
 * leafOp(key, value) -> output
 *
 * To process this, first prehash the keys and values if needed (ANY means no hash in this case):
 * hkey = prehashKey(key)
 * hvalue = prehashValue(value)
 *
 * Then combine the bytes, and hash it
 * output = hash(prefix || length(hkey) || hkey || length(hvalue) || hvalue)
 */
export interface LeafOp {
    hash: HashOp;
    prehash_key: HashOp;
    prehash_value: HashOp;
    length: LengthOp;
    /**
     * prefix is a fixed bytes that may optionally be included at the beginning to differentiate
     * a leaf node from an inner node.
     */
    prefix: Uint8Array;
}
/**
 * InnerOp represents a merkle-proof step that is not a leaf.
 * It represents concatenating two children and hashing them to provide the next result.
 *
 * The result of the previous step is passed in, so the signature of this op is:
 * innerOp(child) -> output
 *
 * The result of applying InnerOp should be:
 * output = op.hash(op.prefix || child || op.suffix)
 *
 * where the || operator is concatenation of binary data,
 * and child is the result of hashing all the tree below this step.
 *
 * Any special data, like prepending child with the length, or prepending the entire operation with
 * some value to differentiate from leaf nodes, should be included in prefix and suffix.
 * If either of prefix or suffix is empty, we just treat it as an empty string
 */
export interface InnerOp {
    hash: HashOp;
    prefix: Uint8Array;
    suffix: Uint8Array;
}
/**
 * ProofSpec defines what the expected parameters are for a given proof type.
 * This can be stored in the client and used to validate any incoming proofs.
 *
 * verify(ProofSpec, Proof) -> Proof | Error
 *
 * As demonstrated in tests, if we don't fix the algorithm used to calculate the
 * LeafHash for a given tree, there are many possible key-value pairs that can
 * generate a given hash (by interpretting the preimage differently).
 * We need this for proper security, requires client knows a priori what
 * tree format server uses. But not in code, rather a configuration object.
 */
export interface ProofSpec {
    /**
     * any field in the ExistenceProof must be the same as in this spec.
     * except Prefix, which is just the first bytes of prefix (spec can be longer)
     */
    leaf_spec?: LeafOp;
    inner_spec?: InnerSpec;
    /** max_depth (if > 0) is the maximum number of InnerOps allowed (mainly for fixed-depth tries) */
    max_depth: number;
    /** min_depth (if > 0) is the minimum number of InnerOps allowed (mainly for fixed-depth tries) */
    min_depth: number;
}
/**
 * InnerSpec contains all store-specific structure info to determine if two proofs from a
 * given store are neighbors.
 *
 * This enables:
 *
 * isLeftMost(spec: InnerSpec, op: InnerOp)
 * isRightMost(spec: InnerSpec, op: InnerOp)
 * isLeftNeighbor(spec: InnerSpec, left: InnerOp, right: InnerOp)
 */
export interface InnerSpec {
    /**
     * Child order is the ordering of the children node, must count from 0
     * iavl tree is [0, 1] (left then right)
     * merk is [0, 2, 1] (left, right, here)
     */
    child_order: number[];
    child_size: number;
    min_prefix_length: number;
    max_prefix_length: number;
    /** empty child is the prehash image that is used when one child is nil (eg. 20 bytes of 0) */
    empty_child: Uint8Array;
    /** hash is the algorithm that must be used for each InnerOp */
    hash: HashOp;
}
/** BatchProof is a group of multiple proof types than can be compressed */
export interface BatchProof {
    entries: BatchEntry[];
}
/** Use BatchEntry not CommitmentProof, to avoid recursion */
export interface BatchEntry {
    exist?: ExistenceProof | undefined;
    nonexist?: NonExistenceProof | undefined;
}
export interface CompressedBatchProof {
    entries: CompressedBatchEntry[];
    lookup_inners: InnerOp[];
}
/** Use BatchEntry not CommitmentProof, to avoid recursion */
export interface CompressedBatchEntry {
    exist?: CompressedExistenceProof | undefined;
    nonexist?: CompressedNonExistenceProof | undefined;
}
export interface CompressedExistenceProof {
    key: Uint8Array;
    value: Uint8Array;
    leaf?: LeafOp;
    /** these are indexes into the lookup_inners table in CompressedBatchProof */
    path: number[];
}
export interface CompressedNonExistenceProof {
    /** TODO: remove this as unnecessary??? we prove a range */
    key: Uint8Array;
    left?: CompressedExistenceProof;
    right?: CompressedExistenceProof;
}
export declare const ExistenceProof: {
    encode(message: ExistenceProof, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): ExistenceProof;
    fromJSON(object: any): ExistenceProof;
    toJSON(message: ExistenceProof): unknown;
    fromPartial<I extends {
        key?: Uint8Array | undefined;
        value?: Uint8Array | undefined;
        leaf?: {
            hash?: HashOp | undefined;
            prehash_key?: HashOp | undefined;
            prehash_value?: HashOp | undefined;
            length?: LengthOp | undefined;
            prefix?: Uint8Array | undefined;
        } | undefined;
        path?: {
            hash?: HashOp | undefined;
            prefix?: Uint8Array | undefined;
            suffix?: Uint8Array | undefined;
        }[] | undefined;
    } & {
        key?: Uint8Array | undefined;
        value?: Uint8Array | undefined;
        leaf?: ({
            hash?: HashOp | undefined;
            prehash_key?: HashOp | undefined;
            prehash_value?: HashOp | undefined;
            length?: LengthOp | undefined;
            prefix?: Uint8Array | undefined;
        } & {
            hash?: HashOp | undefined;
            prehash_key?: HashOp | undefined;
            prehash_value?: HashOp | undefined;
            length?: LengthOp | undefined;
            prefix?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["leaf"], keyof LeafOp>, never>) | undefined;
        path?: ({
            hash?: HashOp | undefined;
            prefix?: Uint8Array | undefined;
            suffix?: Uint8Array | undefined;
        }[] & ({
            hash?: HashOp | undefined;
            prefix?: Uint8Array | undefined;
            suffix?: Uint8Array | undefined;
        } & {
            hash?: HashOp | undefined;
            prefix?: Uint8Array | undefined;
            suffix?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["path"], keyof {
            hash?: HashOp | undefined;
            prefix?: Uint8Array | undefined;
            suffix?: Uint8Array | undefined;
        }[]>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof ExistenceProof>, never>>(object: I): ExistenceProof;
};
export declare const NonExistenceProof: {
    encode(message: NonExistenceProof, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): NonExistenceProof;
    fromJSON(object: any): NonExistenceProof;
    toJSON(message: NonExistenceProof): unknown;
    fromPartial<I extends {
        key?: Uint8Array | undefined;
        left?: {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] | undefined;
        } | undefined;
        right?: {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] | undefined;
        } | undefined;
    } & {
        key?: Uint8Array | undefined;
        left?: ({
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] | undefined;
        } & {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: ({
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["left"]["leaf"], keyof LeafOp>, never>) | undefined;
            path?: ({
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] & ({
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            } & {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["left"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["left"]["path"], keyof {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[]>, never>) | undefined;
        } & Record<Exclude<keyof I["left"], keyof ExistenceProof>, never>) | undefined;
        right?: ({
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] | undefined;
        } & {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: ({
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["right"]["leaf"], keyof LeafOp>, never>) | undefined;
            path?: ({
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] & ({
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            } & {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["right"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["right"]["path"], keyof {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[]>, never>) | undefined;
        } & Record<Exclude<keyof I["right"], keyof ExistenceProof>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof NonExistenceProof>, never>>(object: I): NonExistenceProof;
};
export declare const CommitmentProof: {
    encode(message: CommitmentProof, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): CommitmentProof;
    fromJSON(object: any): CommitmentProof;
    toJSON(message: CommitmentProof): unknown;
    fromPartial<I extends {
        exist?: {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] | undefined;
        } | undefined;
        nonexist?: {
            key?: Uint8Array | undefined;
            left?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } | undefined;
            right?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } | undefined;
        } | undefined;
        batch?: {
            entries?: {
                exist?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
                nonexist?: {
                    key?: Uint8Array | undefined;
                    left?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } | undefined;
                    right?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } | undefined;
                } | undefined;
            }[] | undefined;
        } | undefined;
        compressed?: {
            entries?: {
                exist?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
                nonexist?: {
                    key?: Uint8Array | undefined;
                    left?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } | undefined;
                    right?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } | undefined;
                } | undefined;
            }[] | undefined;
            lookup_inners?: {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] | undefined;
        } | undefined;
    } & {
        exist?: ({
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] | undefined;
        } & {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: ({
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["exist"]["leaf"], keyof LeafOp>, never>) | undefined;
            path?: ({
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] & ({
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            } & {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["exist"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["exist"]["path"], keyof {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[]>, never>) | undefined;
        } & Record<Exclude<keyof I["exist"], keyof ExistenceProof>, never>) | undefined;
        nonexist?: ({
            key?: Uint8Array | undefined;
            left?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } | undefined;
            right?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } | undefined;
        } & {
            key?: Uint8Array | undefined;
            left?: ({
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } & {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: ({
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["nonexist"]["left"]["leaf"], keyof LeafOp>, never>) | undefined;
                path?: ({
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] & ({
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                } & {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["nonexist"]["left"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["nonexist"]["left"]["path"], keyof {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[]>, never>) | undefined;
            } & Record<Exclude<keyof I["nonexist"]["left"], keyof ExistenceProof>, never>) | undefined;
            right?: ({
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } & {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: ({
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["nonexist"]["right"]["leaf"], keyof LeafOp>, never>) | undefined;
                path?: ({
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] & ({
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                } & {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["nonexist"]["right"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["nonexist"]["right"]["path"], keyof {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[]>, never>) | undefined;
            } & Record<Exclude<keyof I["nonexist"]["right"], keyof ExistenceProof>, never>) | undefined;
        } & Record<Exclude<keyof I["nonexist"], keyof NonExistenceProof>, never>) | undefined;
        batch?: ({
            entries?: {
                exist?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
                nonexist?: {
                    key?: Uint8Array | undefined;
                    left?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } | undefined;
                    right?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } | undefined;
                } | undefined;
            }[] | undefined;
        } & {
            entries?: ({
                exist?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
                nonexist?: {
                    key?: Uint8Array | undefined;
                    left?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } | undefined;
                    right?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } | undefined;
                } | undefined;
            }[] & ({
                exist?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
                nonexist?: {
                    key?: Uint8Array | undefined;
                    left?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } | undefined;
                    right?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } | undefined;
                } | undefined;
            } & {
                exist?: ({
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } & {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: ({
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } & {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } & Record<Exclude<keyof I["batch"]["entries"][number]["exist"]["leaf"], keyof LeafOp>, never>) | undefined;
                    path?: ({
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] & ({
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    } & {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    } & Record<Exclude<keyof I["batch"]["entries"][number]["exist"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["batch"]["entries"][number]["exist"]["path"], keyof {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[]>, never>) | undefined;
                } & Record<Exclude<keyof I["batch"]["entries"][number]["exist"], keyof ExistenceProof>, never>) | undefined;
                nonexist?: ({
                    key?: Uint8Array | undefined;
                    left?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } | undefined;
                    right?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    key?: Uint8Array | undefined;
                    left?: ({
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } & {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: ({
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } & {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } & Record<Exclude<keyof I["batch"]["entries"][number]["nonexist"]["left"]["leaf"], keyof LeafOp>, never>) | undefined;
                        path?: ({
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] & ({
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        } & {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        } & Record<Exclude<keyof I["batch"]["entries"][number]["nonexist"]["left"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["batch"]["entries"][number]["nonexist"]["left"]["path"], keyof {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[]>, never>) | undefined;
                    } & Record<Exclude<keyof I["batch"]["entries"][number]["nonexist"]["left"], keyof ExistenceProof>, never>) | undefined;
                    right?: ({
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } & {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: ({
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } & {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } & Record<Exclude<keyof I["batch"]["entries"][number]["nonexist"]["right"]["leaf"], keyof LeafOp>, never>) | undefined;
                        path?: ({
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] & ({
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        } & {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        } & Record<Exclude<keyof I["batch"]["entries"][number]["nonexist"]["right"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["batch"]["entries"][number]["nonexist"]["right"]["path"], keyof {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[]>, never>) | undefined;
                    } & Record<Exclude<keyof I["batch"]["entries"][number]["nonexist"]["right"], keyof ExistenceProof>, never>) | undefined;
                } & Record<Exclude<keyof I["batch"]["entries"][number]["nonexist"], keyof NonExistenceProof>, never>) | undefined;
            } & Record<Exclude<keyof I["batch"]["entries"][number], keyof BatchEntry>, never>)[] & Record<Exclude<keyof I["batch"]["entries"], keyof {
                exist?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
                nonexist?: {
                    key?: Uint8Array | undefined;
                    left?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } | undefined;
                    right?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: {
                            hash?: HashOp | undefined;
                            prefix?: Uint8Array | undefined;
                            suffix?: Uint8Array | undefined;
                        }[] | undefined;
                    } | undefined;
                } | undefined;
            }[]>, never>) | undefined;
        } & Record<Exclude<keyof I["batch"], "entries">, never>) | undefined;
        compressed?: ({
            entries?: {
                exist?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
                nonexist?: {
                    key?: Uint8Array | undefined;
                    left?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } | undefined;
                    right?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } | undefined;
                } | undefined;
            }[] | undefined;
            lookup_inners?: {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] | undefined;
        } & {
            entries?: ({
                exist?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
                nonexist?: {
                    key?: Uint8Array | undefined;
                    left?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } | undefined;
                    right?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } | undefined;
                } | undefined;
            }[] & ({
                exist?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
                nonexist?: {
                    key?: Uint8Array | undefined;
                    left?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } | undefined;
                    right?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } | undefined;
                } | undefined;
            } & {
                exist?: ({
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } & {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: ({
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } & {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } & Record<Exclude<keyof I["compressed"]["entries"][number]["exist"]["leaf"], keyof LeafOp>, never>) | undefined;
                    path?: (number[] & number[] & Record<Exclude<keyof I["compressed"]["entries"][number]["exist"]["path"], keyof number[]>, never>) | undefined;
                } & Record<Exclude<keyof I["compressed"]["entries"][number]["exist"], keyof CompressedExistenceProof>, never>) | undefined;
                nonexist?: ({
                    key?: Uint8Array | undefined;
                    left?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } | undefined;
                    right?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } | undefined;
                } & {
                    key?: Uint8Array | undefined;
                    left?: ({
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } & {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: ({
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } & {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } & Record<Exclude<keyof I["compressed"]["entries"][number]["nonexist"]["left"]["leaf"], keyof LeafOp>, never>) | undefined;
                        path?: (number[] & number[] & Record<Exclude<keyof I["compressed"]["entries"][number]["nonexist"]["left"]["path"], keyof number[]>, never>) | undefined;
                    } & Record<Exclude<keyof I["compressed"]["entries"][number]["nonexist"]["left"], keyof CompressedExistenceProof>, never>) | undefined;
                    right?: ({
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } & {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: ({
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } & {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } & Record<Exclude<keyof I["compressed"]["entries"][number]["nonexist"]["right"]["leaf"], keyof LeafOp>, never>) | undefined;
                        path?: (number[] & number[] & Record<Exclude<keyof I["compressed"]["entries"][number]["nonexist"]["right"]["path"], keyof number[]>, never>) | undefined;
                    } & Record<Exclude<keyof I["compressed"]["entries"][number]["nonexist"]["right"], keyof CompressedExistenceProof>, never>) | undefined;
                } & Record<Exclude<keyof I["compressed"]["entries"][number]["nonexist"], keyof CompressedNonExistenceProof>, never>) | undefined;
            } & Record<Exclude<keyof I["compressed"]["entries"][number], keyof CompressedBatchEntry>, never>)[] & Record<Exclude<keyof I["compressed"]["entries"], keyof {
                exist?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
                nonexist?: {
                    key?: Uint8Array | undefined;
                    left?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } | undefined;
                    right?: {
                        key?: Uint8Array | undefined;
                        value?: Uint8Array | undefined;
                        leaf?: {
                            hash?: HashOp | undefined;
                            prehash_key?: HashOp | undefined;
                            prehash_value?: HashOp | undefined;
                            length?: LengthOp | undefined;
                            prefix?: Uint8Array | undefined;
                        } | undefined;
                        path?: number[] | undefined;
                    } | undefined;
                } | undefined;
            }[]>, never>) | undefined;
            lookup_inners?: ({
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] & ({
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            } & {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["compressed"]["lookup_inners"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["compressed"]["lookup_inners"], keyof {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[]>, never>) | undefined;
        } & Record<Exclude<keyof I["compressed"], keyof CompressedBatchProof>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof CommitmentProof>, never>>(object: I): CommitmentProof;
};
export declare const LeafOp: {
    encode(message: LeafOp, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): LeafOp;
    fromJSON(object: any): LeafOp;
    toJSON(message: LeafOp): unknown;
    fromPartial<I extends {
        hash?: HashOp | undefined;
        prehash_key?: HashOp | undefined;
        prehash_value?: HashOp | undefined;
        length?: LengthOp | undefined;
        prefix?: Uint8Array | undefined;
    } & {
        hash?: HashOp | undefined;
        prehash_key?: HashOp | undefined;
        prehash_value?: HashOp | undefined;
        length?: LengthOp | undefined;
        prefix?: Uint8Array | undefined;
    } & Record<Exclude<keyof I, keyof LeafOp>, never>>(object: I): LeafOp;
};
export declare const InnerOp: {
    encode(message: InnerOp, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): InnerOp;
    fromJSON(object: any): InnerOp;
    toJSON(message: InnerOp): unknown;
    fromPartial<I extends {
        hash?: HashOp | undefined;
        prefix?: Uint8Array | undefined;
        suffix?: Uint8Array | undefined;
    } & {
        hash?: HashOp | undefined;
        prefix?: Uint8Array | undefined;
        suffix?: Uint8Array | undefined;
    } & Record<Exclude<keyof I, keyof InnerOp>, never>>(object: I): InnerOp;
};
export declare const ProofSpec: {
    encode(message: ProofSpec, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): ProofSpec;
    fromJSON(object: any): ProofSpec;
    toJSON(message: ProofSpec): unknown;
    fromPartial<I extends {
        leaf_spec?: {
            hash?: HashOp | undefined;
            prehash_key?: HashOp | undefined;
            prehash_value?: HashOp | undefined;
            length?: LengthOp | undefined;
            prefix?: Uint8Array | undefined;
        } | undefined;
        inner_spec?: {
            child_order?: number[] | undefined;
            child_size?: number | undefined;
            min_prefix_length?: number | undefined;
            max_prefix_length?: number | undefined;
            empty_child?: Uint8Array | undefined;
            hash?: HashOp | undefined;
        } | undefined;
        max_depth?: number | undefined;
        min_depth?: number | undefined;
    } & {
        leaf_spec?: ({
            hash?: HashOp | undefined;
            prehash_key?: HashOp | undefined;
            prehash_value?: HashOp | undefined;
            length?: LengthOp | undefined;
            prefix?: Uint8Array | undefined;
        } & {
            hash?: HashOp | undefined;
            prehash_key?: HashOp | undefined;
            prehash_value?: HashOp | undefined;
            length?: LengthOp | undefined;
            prefix?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["leaf_spec"], keyof LeafOp>, never>) | undefined;
        inner_spec?: ({
            child_order?: number[] | undefined;
            child_size?: number | undefined;
            min_prefix_length?: number | undefined;
            max_prefix_length?: number | undefined;
            empty_child?: Uint8Array | undefined;
            hash?: HashOp | undefined;
        } & {
            child_order?: (number[] & number[] & Record<Exclude<keyof I["inner_spec"]["child_order"], keyof number[]>, never>) | undefined;
            child_size?: number | undefined;
            min_prefix_length?: number | undefined;
            max_prefix_length?: number | undefined;
            empty_child?: Uint8Array | undefined;
            hash?: HashOp | undefined;
        } & Record<Exclude<keyof I["inner_spec"], keyof InnerSpec>, never>) | undefined;
        max_depth?: number | undefined;
        min_depth?: number | undefined;
    } & Record<Exclude<keyof I, keyof ProofSpec>, never>>(object: I): ProofSpec;
};
export declare const InnerSpec: {
    encode(message: InnerSpec, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): InnerSpec;
    fromJSON(object: any): InnerSpec;
    toJSON(message: InnerSpec): unknown;
    fromPartial<I extends {
        child_order?: number[] | undefined;
        child_size?: number | undefined;
        min_prefix_length?: number | undefined;
        max_prefix_length?: number | undefined;
        empty_child?: Uint8Array | undefined;
        hash?: HashOp | undefined;
    } & {
        child_order?: (number[] & number[] & Record<Exclude<keyof I["child_order"], keyof number[]>, never>) | undefined;
        child_size?: number | undefined;
        min_prefix_length?: number | undefined;
        max_prefix_length?: number | undefined;
        empty_child?: Uint8Array | undefined;
        hash?: HashOp | undefined;
    } & Record<Exclude<keyof I, keyof InnerSpec>, never>>(object: I): InnerSpec;
};
export declare const BatchProof: {
    encode(message: BatchProof, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): BatchProof;
    fromJSON(object: any): BatchProof;
    toJSON(message: BatchProof): unknown;
    fromPartial<I extends {
        entries?: {
            exist?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } | undefined;
            nonexist?: {
                key?: Uint8Array | undefined;
                left?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
                right?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
            } | undefined;
        }[] | undefined;
    } & {
        entries?: ({
            exist?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } | undefined;
            nonexist?: {
                key?: Uint8Array | undefined;
                left?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
                right?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
            } | undefined;
        }[] & ({
            exist?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } | undefined;
            nonexist?: {
                key?: Uint8Array | undefined;
                left?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
                right?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
            } | undefined;
        } & {
            exist?: ({
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } & {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: ({
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["entries"][number]["exist"]["leaf"], keyof LeafOp>, never>) | undefined;
                path?: ({
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] & ({
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                } & {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["entries"][number]["exist"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["entries"][number]["exist"]["path"], keyof {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[]>, never>) | undefined;
            } & Record<Exclude<keyof I["entries"][number]["exist"], keyof ExistenceProof>, never>) | undefined;
            nonexist?: ({
                key?: Uint8Array | undefined;
                left?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
                right?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
            } & {
                key?: Uint8Array | undefined;
                left?: ({
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } & {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: ({
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } & {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } & Record<Exclude<keyof I["entries"][number]["nonexist"]["left"]["leaf"], keyof LeafOp>, never>) | undefined;
                    path?: ({
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] & ({
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    } & {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    } & Record<Exclude<keyof I["entries"][number]["nonexist"]["left"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["entries"][number]["nonexist"]["left"]["path"], keyof {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[]>, never>) | undefined;
                } & Record<Exclude<keyof I["entries"][number]["nonexist"]["left"], keyof ExistenceProof>, never>) | undefined;
                right?: ({
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } & {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: ({
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } & {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } & Record<Exclude<keyof I["entries"][number]["nonexist"]["right"]["leaf"], keyof LeafOp>, never>) | undefined;
                    path?: ({
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] & ({
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    } & {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    } & Record<Exclude<keyof I["entries"][number]["nonexist"]["right"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["entries"][number]["nonexist"]["right"]["path"], keyof {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[]>, never>) | undefined;
                } & Record<Exclude<keyof I["entries"][number]["nonexist"]["right"], keyof ExistenceProof>, never>) | undefined;
            } & Record<Exclude<keyof I["entries"][number]["nonexist"], keyof NonExistenceProof>, never>) | undefined;
        } & Record<Exclude<keyof I["entries"][number], keyof BatchEntry>, never>)[] & Record<Exclude<keyof I["entries"], keyof {
            exist?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } | undefined;
            nonexist?: {
                key?: Uint8Array | undefined;
                left?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
                right?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: {
                        hash?: HashOp | undefined;
                        prefix?: Uint8Array | undefined;
                        suffix?: Uint8Array | undefined;
                    }[] | undefined;
                } | undefined;
            } | undefined;
        }[]>, never>) | undefined;
    } & Record<Exclude<keyof I, "entries">, never>>(object: I): BatchProof;
};
export declare const BatchEntry: {
    encode(message: BatchEntry, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): BatchEntry;
    fromJSON(object: any): BatchEntry;
    toJSON(message: BatchEntry): unknown;
    fromPartial<I extends {
        exist?: {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] | undefined;
        } | undefined;
        nonexist?: {
            key?: Uint8Array | undefined;
            left?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } | undefined;
            right?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } | undefined;
        } | undefined;
    } & {
        exist?: ({
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] | undefined;
        } & {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: ({
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["exist"]["leaf"], keyof LeafOp>, never>) | undefined;
            path?: ({
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[] & ({
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            } & {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["exist"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["exist"]["path"], keyof {
                hash?: HashOp | undefined;
                prefix?: Uint8Array | undefined;
                suffix?: Uint8Array | undefined;
            }[]>, never>) | undefined;
        } & Record<Exclude<keyof I["exist"], keyof ExistenceProof>, never>) | undefined;
        nonexist?: ({
            key?: Uint8Array | undefined;
            left?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } | undefined;
            right?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } | undefined;
        } & {
            key?: Uint8Array | undefined;
            left?: ({
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } & {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: ({
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["nonexist"]["left"]["leaf"], keyof LeafOp>, never>) | undefined;
                path?: ({
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] & ({
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                } & {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["nonexist"]["left"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["nonexist"]["left"]["path"], keyof {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[]>, never>) | undefined;
            } & Record<Exclude<keyof I["nonexist"]["left"], keyof ExistenceProof>, never>) | undefined;
            right?: ({
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] | undefined;
            } & {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: ({
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["nonexist"]["right"]["leaf"], keyof LeafOp>, never>) | undefined;
                path?: ({
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[] & ({
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                } & {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["nonexist"]["right"]["path"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["nonexist"]["right"]["path"], keyof {
                    hash?: HashOp | undefined;
                    prefix?: Uint8Array | undefined;
                    suffix?: Uint8Array | undefined;
                }[]>, never>) | undefined;
            } & Record<Exclude<keyof I["nonexist"]["right"], keyof ExistenceProof>, never>) | undefined;
        } & Record<Exclude<keyof I["nonexist"], keyof NonExistenceProof>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof BatchEntry>, never>>(object: I): BatchEntry;
};
export declare const CompressedBatchProof: {
    encode(message: CompressedBatchProof, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): CompressedBatchProof;
    fromJSON(object: any): CompressedBatchProof;
    toJSON(message: CompressedBatchProof): unknown;
    fromPartial<I extends {
        entries?: {
            exist?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: number[] | undefined;
            } | undefined;
            nonexist?: {
                key?: Uint8Array | undefined;
                left?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
                right?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
            } | undefined;
        }[] | undefined;
        lookup_inners?: {
            hash?: HashOp | undefined;
            prefix?: Uint8Array | undefined;
            suffix?: Uint8Array | undefined;
        }[] | undefined;
    } & {
        entries?: ({
            exist?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: number[] | undefined;
            } | undefined;
            nonexist?: {
                key?: Uint8Array | undefined;
                left?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
                right?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
            } | undefined;
        }[] & ({
            exist?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: number[] | undefined;
            } | undefined;
            nonexist?: {
                key?: Uint8Array | undefined;
                left?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
                right?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
            } | undefined;
        } & {
            exist?: ({
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: number[] | undefined;
            } & {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: ({
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["entries"][number]["exist"]["leaf"], keyof LeafOp>, never>) | undefined;
                path?: (number[] & number[] & Record<Exclude<keyof I["entries"][number]["exist"]["path"], keyof number[]>, never>) | undefined;
            } & Record<Exclude<keyof I["entries"][number]["exist"], keyof CompressedExistenceProof>, never>) | undefined;
            nonexist?: ({
                key?: Uint8Array | undefined;
                left?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
                right?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
            } & {
                key?: Uint8Array | undefined;
                left?: ({
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } & {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: ({
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } & {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } & Record<Exclude<keyof I["entries"][number]["nonexist"]["left"]["leaf"], keyof LeafOp>, never>) | undefined;
                    path?: (number[] & number[] & Record<Exclude<keyof I["entries"][number]["nonexist"]["left"]["path"], keyof number[]>, never>) | undefined;
                } & Record<Exclude<keyof I["entries"][number]["nonexist"]["left"], keyof CompressedExistenceProof>, never>) | undefined;
                right?: ({
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } & {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: ({
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } & {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } & Record<Exclude<keyof I["entries"][number]["nonexist"]["right"]["leaf"], keyof LeafOp>, never>) | undefined;
                    path?: (number[] & number[] & Record<Exclude<keyof I["entries"][number]["nonexist"]["right"]["path"], keyof number[]>, never>) | undefined;
                } & Record<Exclude<keyof I["entries"][number]["nonexist"]["right"], keyof CompressedExistenceProof>, never>) | undefined;
            } & Record<Exclude<keyof I["entries"][number]["nonexist"], keyof CompressedNonExistenceProof>, never>) | undefined;
        } & Record<Exclude<keyof I["entries"][number], keyof CompressedBatchEntry>, never>)[] & Record<Exclude<keyof I["entries"], keyof {
            exist?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: number[] | undefined;
            } | undefined;
            nonexist?: {
                key?: Uint8Array | undefined;
                left?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
                right?: {
                    key?: Uint8Array | undefined;
                    value?: Uint8Array | undefined;
                    leaf?: {
                        hash?: HashOp | undefined;
                        prehash_key?: HashOp | undefined;
                        prehash_value?: HashOp | undefined;
                        length?: LengthOp | undefined;
                        prefix?: Uint8Array | undefined;
                    } | undefined;
                    path?: number[] | undefined;
                } | undefined;
            } | undefined;
        }[]>, never>) | undefined;
        lookup_inners?: ({
            hash?: HashOp | undefined;
            prefix?: Uint8Array | undefined;
            suffix?: Uint8Array | undefined;
        }[] & ({
            hash?: HashOp | undefined;
            prefix?: Uint8Array | undefined;
            suffix?: Uint8Array | undefined;
        } & {
            hash?: HashOp | undefined;
            prefix?: Uint8Array | undefined;
            suffix?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["lookup_inners"][number], keyof InnerOp>, never>)[] & Record<Exclude<keyof I["lookup_inners"], keyof {
            hash?: HashOp | undefined;
            prefix?: Uint8Array | undefined;
            suffix?: Uint8Array | undefined;
        }[]>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof CompressedBatchProof>, never>>(object: I): CompressedBatchProof;
};
export declare const CompressedBatchEntry: {
    encode(message: CompressedBatchEntry, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): CompressedBatchEntry;
    fromJSON(object: any): CompressedBatchEntry;
    toJSON(message: CompressedBatchEntry): unknown;
    fromPartial<I extends {
        exist?: {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: number[] | undefined;
        } | undefined;
        nonexist?: {
            key?: Uint8Array | undefined;
            left?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: number[] | undefined;
            } | undefined;
            right?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: number[] | undefined;
            } | undefined;
        } | undefined;
    } & {
        exist?: ({
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: number[] | undefined;
        } & {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: ({
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["exist"]["leaf"], keyof LeafOp>, never>) | undefined;
            path?: (number[] & number[] & Record<Exclude<keyof I["exist"]["path"], keyof number[]>, never>) | undefined;
        } & Record<Exclude<keyof I["exist"], keyof CompressedExistenceProof>, never>) | undefined;
        nonexist?: ({
            key?: Uint8Array | undefined;
            left?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: number[] | undefined;
            } | undefined;
            right?: {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: number[] | undefined;
            } | undefined;
        } & {
            key?: Uint8Array | undefined;
            left?: ({
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: number[] | undefined;
            } & {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: ({
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["nonexist"]["left"]["leaf"], keyof LeafOp>, never>) | undefined;
                path?: (number[] & number[] & Record<Exclude<keyof I["nonexist"]["left"]["path"], keyof number[]>, never>) | undefined;
            } & Record<Exclude<keyof I["nonexist"]["left"], keyof CompressedExistenceProof>, never>) | undefined;
            right?: ({
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } | undefined;
                path?: number[] | undefined;
            } & {
                key?: Uint8Array | undefined;
                value?: Uint8Array | undefined;
                leaf?: ({
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & {
                    hash?: HashOp | undefined;
                    prehash_key?: HashOp | undefined;
                    prehash_value?: HashOp | undefined;
                    length?: LengthOp | undefined;
                    prefix?: Uint8Array | undefined;
                } & Record<Exclude<keyof I["nonexist"]["right"]["leaf"], keyof LeafOp>, never>) | undefined;
                path?: (number[] & number[] & Record<Exclude<keyof I["nonexist"]["right"]["path"], keyof number[]>, never>) | undefined;
            } & Record<Exclude<keyof I["nonexist"]["right"], keyof CompressedExistenceProof>, never>) | undefined;
        } & Record<Exclude<keyof I["nonexist"], keyof CompressedNonExistenceProof>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof CompressedBatchEntry>, never>>(object: I): CompressedBatchEntry;
};
export declare const CompressedExistenceProof: {
    encode(message: CompressedExistenceProof, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): CompressedExistenceProof;
    fromJSON(object: any): CompressedExistenceProof;
    toJSON(message: CompressedExistenceProof): unknown;
    fromPartial<I extends {
        key?: Uint8Array | undefined;
        value?: Uint8Array | undefined;
        leaf?: {
            hash?: HashOp | undefined;
            prehash_key?: HashOp | undefined;
            prehash_value?: HashOp | undefined;
            length?: LengthOp | undefined;
            prefix?: Uint8Array | undefined;
        } | undefined;
        path?: number[] | undefined;
    } & {
        key?: Uint8Array | undefined;
        value?: Uint8Array | undefined;
        leaf?: ({
            hash?: HashOp | undefined;
            prehash_key?: HashOp | undefined;
            prehash_value?: HashOp | undefined;
            length?: LengthOp | undefined;
            prefix?: Uint8Array | undefined;
        } & {
            hash?: HashOp | undefined;
            prehash_key?: HashOp | undefined;
            prehash_value?: HashOp | undefined;
            length?: LengthOp | undefined;
            prefix?: Uint8Array | undefined;
        } & Record<Exclude<keyof I["leaf"], keyof LeafOp>, never>) | undefined;
        path?: (number[] & number[] & Record<Exclude<keyof I["path"], keyof number[]>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof CompressedExistenceProof>, never>>(object: I): CompressedExistenceProof;
};
export declare const CompressedNonExistenceProof: {
    encode(message: CompressedNonExistenceProof, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): CompressedNonExistenceProof;
    fromJSON(object: any): CompressedNonExistenceProof;
    toJSON(message: CompressedNonExistenceProof): unknown;
    fromPartial<I extends {
        key?: Uint8Array | undefined;
        left?: {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: number[] | undefined;
        } | undefined;
        right?: {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: number[] | undefined;
        } | undefined;
    } & {
        key?: Uint8Array | undefined;
        left?: ({
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: number[] | undefined;
        } & {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: ({
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["left"]["leaf"], keyof LeafOp>, never>) | undefined;
            path?: (number[] & number[] & Record<Exclude<keyof I["left"]["path"], keyof number[]>, never>) | undefined;
        } & Record<Exclude<keyof I["left"], keyof CompressedExistenceProof>, never>) | undefined;
        right?: ({
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } | undefined;
            path?: number[] | undefined;
        } & {
            key?: Uint8Array | undefined;
            value?: Uint8Array | undefined;
            leaf?: ({
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & {
                hash?: HashOp | undefined;
                prehash_key?: HashOp | undefined;
                prehash_value?: HashOp | undefined;
                length?: LengthOp | undefined;
                prefix?: Uint8Array | undefined;
            } & Record<Exclude<keyof I["right"]["leaf"], keyof LeafOp>, never>) | undefined;
            path?: (number[] & number[] & Record<Exclude<keyof I["right"]["path"], keyof number[]>, never>) | undefined;
        } & Record<Exclude<keyof I["right"], keyof CompressedExistenceProof>, never>) | undefined;
    } & Record<Exclude<keyof I, keyof CompressedNonExistenceProof>, never>>(object: I): CompressedNonExistenceProof;
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
//# sourceMappingURL=proofs.d.ts.map