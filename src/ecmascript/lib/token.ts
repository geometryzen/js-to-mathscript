import { IRegExpFlags } from './IRegExpFlags';
import { SourceLocation } from './scanner';

export const enum Token {
    BooleanLiteral = 1,
    EOF,
    Identifier,
    Keyword,
    NullLiteral,
    NumericLiteral,
    Punctuator,
    StringLiteral,
    RegularExpression,
    Template,
    JSXIdentifier,
    JSXText,
}

// type keywords = 'async' | 'await' | 'class' | 'constructor' | 'delete' | 'for' | 'function' | 'get' | 'if' | 'in' | 'let' | 'new' | 'set' | 'super' | 'target' | 'this' | 'typeof' | 'void' | 'while' | 'with' | 'yield';
// type more = '{' | '(' | '[' | '*' | ':' | ',' | ';' | '=' | '.' | '...' | '*=' | '**=' | '/=' | '%=' | '+=' | '-=' | '<<=' | '>>=' | '>>>=' | '&=' | '^=' | '|=';
// type arithmetic = '+' | '-' | '!' | '~' | '++' | '--' | '/';

/**
 * A string may be a bit imprecise, but we also have to allow for identifiers.
 * A possibility may be to split the value into two fields?
 * The scanner puts numbers in this type.
 */
export type RawTokenValue = string | number | null;

/**
 * Raw tokens are produced by the scanner.ts
 */
export interface RawToken {
    type: Token;
    value: RawTokenValue;
    pattern?: string;
    flags?: string;
    regex?: RegExp | null;
    octal?: boolean;
    cooked?: string;
    head?: boolean;
    tail?: boolean;
    lineNumber: number;
    lineStart: number;
    start: number;
    end: number;
}

export const TokenName: { [token: number]: string } = {};
TokenName[Token.BooleanLiteral] = 'Boolean';
TokenName[Token.EOF] = '<end>';
TokenName[Token.Identifier] = 'Identifier';
TokenName[Token.Keyword] = 'Keyword';
TokenName[Token.NullLiteral] = 'Null';
TokenName[Token.NumericLiteral] = 'Numeric';
TokenName[Token.Punctuator] = 'Punctuator';
TokenName[Token.StringLiteral] = 'String';
TokenName[Token.RegularExpression] = 'RegularExpression';
TokenName[Token.Template] = 'Template';
TokenName[Token.JSXIdentifier] = 'JSXIdentifier';
TokenName[Token.JSXText] = 'JSXText';

/**
 * RawToken is converted into IToken by the parser.ts convertToken() function.
 * Hence, this could be called a ParserToken.
 */
export interface TokenEntry {
    type?: string | number | 'BlockComment' | 'LineComment';
    value?: number | string;
    lineNumber?: number;
    lineStart?: number;
    literal?: IRegExpFlags;
    octal?: boolean;
    regex?: { pattern: string; flags: string };
    start?: number;
    startLineNumber?: number;
    startLineStart?: number;
    end?: number;
    loc?: SourceLocation;
    range?: [number, number];
}
