/**
 * Precedence has been adjusted to support operators used for Geometric Algebra.
 */
export const Precedence = {
    Sequence: 0,
    Yield: 1,
    Await: 1,
    Assignment: 1,
    Conditional: 2,
    ArrowFunction: 2,
    NullishCoalescing: 3,
    LogicalOR: 4,
    LogicalAND: 5,
    BitwiseAND: 6,
    Equality: 7,
    Relational: 8,
    Additive: 9,
    Multiplicative: 10,
    BitwiseXOR: 11,
    BitwiseOR: 12,
    BitwiseSHIFT: 13,
    Unary: 14,
    Postfix: 15,
    Call: 16,
    New: 17,
    TaggedTemplate: 18,
    Member: 19,
    Primary: 20,
};
