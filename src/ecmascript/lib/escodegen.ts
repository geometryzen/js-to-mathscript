
import { BinaryPrecedence } from './BinaryPrecedence';
import { isDecimalDigit, isIdentifierPart, isLineTerminator, isWhiteSpace } from './code';
import { Comment } from './comment-handler';
import { ArrayExpression, ArrayPattern, ArrowFunctionExpression, AssignmentExpression, AssignmentPattern, AwaitExpression, BinaryExpression, BindingPattern, BlockStatement, BreakStatement, CallExpression, CatchClause, ClassBody, ClassDeclaration, ClassExpression, ComputedMemberExpression, ConditionalExpression, ContinueStatement, DebuggerStatement, Directive, DoWhileStatement, ExportableDefaultDeclaration, ExportableNamedDeclaration, ExportAllDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration, ExportSpecifier, Expression, ExpressionStatement, ForInStatement, ForOfStatement, ForStatement, FunctionDeclaration, FunctionExpression, FunctionParameter, Identifier, IfStatement, ImportDeclaration, ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier, isArrowFunctionExpression, isAssignmentPattern, isIdentifier, isLiteral, isProgram, isVariableDeclaration, LabeledStatement, Literal, MethodDefinition, Module, NewExpression, ObjectExpression, ObjectPattern, Property, ReturnStatement, Script, SequenceExpression, SpreadElement, Statement, SwitchCase, SwitchStatement, TaggedTemplateExpression, TemplateElement, TemplateLiteral, ThrowStatement, TryStatement, UnaryExpression, UpdateExpression, VariableDeclaration, VariableDeclarator, WhileStatement, WithStatement, YieldExpression } from './nodes';
import { Precedence } from './Precedence';
import { Syntax } from './syntax';

/*
  Copyright (C) 2015-2020 David Holmes <david.geo.holmes@gmail.com>
  Copyright (C) 2012-2014 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2015 Ingvar Stepanyan <me@rreverser.com>
  Copyright (C) 2014 Ivan Nikulin <ifaaan@gmail.com>
  Copyright (C) 2012-2013 Michael Ficarra <escodegen.copyright@michael.ficarra.me>
  Copyright (C) 2012-2013 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2013 Irakli Gozalishvili <rfobic@gmail.com>
  Copyright (C) 2012 Robert Gust-Bardon <donate@robert.gust-bardon.org>
  Copyright (C) 2012 John Freeman <jfreeman08@gmail.com>
  Copyright (C) 2011-2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * This would normally come from the source-map package.
 */
class SourceNode {
    constructor(
        public readonly line: number | null,
        public readonly column: number | null,
        public readonly sourceMap: unknown,
        public readonly generated: SourceNode | string | string[],
        public readonly name: string | null
    ) {
        // Nothing to see here.
    }
    join(sep: string): SourceNode {
        throw new Error(`join(sep=${sep}) method not implemented.`)
    }
    replaceRight(pattern: RegExp, replacement: string): SourceNode {
        throw new Error(`replaceRight(pattern=${pattern}, replacement=${replacement}) method not implemented.`)
    }
    toStringWithSourceMap(arg: { file: string, sourceRoot: unknown }): { code: string; map: { setSourceContent: (sourceMap: string, sourceContent: string) => void } } {
        throw new Error(`toStringWithSourceMap(arg=${JSON.stringify(arg)}) method not implemented.`)
        /*
        return {
            code: '', map: {
                setSourceContent: function (sourceMap: string): void {

                }
            }
        }
        */
    }
}

/**
 * The recursively defined generated structure.
 */
type CODEOUT = string | SourceNode | CODEOUT[];

let preserveBlankLines: boolean;
let base: string;
let extra: GenerateOptions;
let newline: string;
let directive: unknown;
let semicolons: boolean;
let safeConcatenation: unknown;
let indent: string;
let renumber: boolean;
let sourceMap: unknown;
let sourceCode: string;
let quotes: 'double' | 'single' | 'auto';
let parentheses: unknown;
let escapeless: boolean;
let hexadecimal: boolean;
let json: unknown;
let space: string;
// let parse: (arg: unknown) => Module | Script;

// Flags
const F_ALLOW_IN = 1;
const F_ALLOW_CALL = 1 << 1;
const F_ALLOW_UNPARATH_NEW = 1 << 2;
const F_FUNC_BODY = 1 << 3;
const F_DIRECTIVE_CTX = 1 << 4;
const F_SEMICOLON_OPT = 1 << 5;

// Expression flag sets
// NOTE: Flag order:
// F_ALLOW_IN
// F_ALLOW_CALL
// F_ALLOW_UNPARATH_NEW
const E_FTT = F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW;
const E_TTF = F_ALLOW_IN | F_ALLOW_CALL;
const E_TTT = F_ALLOW_IN | F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW;
const E_TFF = F_ALLOW_IN;
const E_FFT = F_ALLOW_UNPARATH_NEW;
const E_TFT = F_ALLOW_IN | F_ALLOW_UNPARATH_NEW;

// Statement flag sets
// NOTE: Flag order:
// F_ALLOW_IN
// F_FUNC_BODY
// F_DIRECTIVE_CTX
// F_SEMICOLON_OPT
const S_TFFF = F_ALLOW_IN;
const S_TFFT = F_ALLOW_IN | F_SEMICOLON_OPT;
const S_FFFF = 0x00;
const S_TFTF = F_ALLOW_IN | F_DIRECTIVE_CTX;
const S_TTFF = F_ALLOW_IN | F_FUNC_BODY;

function getDefaultOptions(): GenerateOptions {
    // default options
    return {
        // parse: null,
        comment: false,
        format: {
            indent: {
                style: '    ',
                base: 0,
                adjustMultilineComment: false,
            },
            newline: '\n',
            space: ' ',
            json: false,
            renumber: false,
            hexadecimal: false,
            quotes: 'single',
            escapeless: false,
            compact: false,
            parentheses: true,
            semicolons: true,
            safeConcatenation: false,
            preserveBlankLines: false,
        },
        moz: {
            comprehensionExpressionStartsWithAssignment: false,
            starlessGenerator: false,
        },
        sourceMap: null,
        sourceMapRoot: null,
        sourceMapWithCode: false,
        directive: false,
        raw: true,
        verbatim: null,
        sourceCode: null,
    };
}

function stringRepeat(str: string, num: number): string {
    let result = '';

    for (num |= 0; num > 0; num >>>= 1, str += str) {
        if (num & 1) {
            result += str;
        }
    }

    return result;
}

function hasLineTerminator(str: string): boolean {
    return /[\r\n]/g.test(str);
}

function endsWithLineTerminator(str: string): boolean {
    const len = str.length;
    return len > 0 && isLineTerminator(str.charCodeAt(len - 1));
}

function updateDeeply(target: { [key: string]: unknown }, override: { [key: string]: unknown }): GenerateOptions {

    function isHashObject(target: unknown): target is { [key: string]: unknown } {
        return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);
    }

    for (const key in override) {
        if (Object.prototype.hasOwnProperty.call(override, key)) {
            const val = override[key];
            if (isHashObject(val)) {
                const targetValue = target[key];
                if (isHashObject(targetValue)) {
                    updateDeeply(targetValue, val);
                } else {
                    target[key] = updateDeeply({}, val);
                }
            } else {
                target[key] = val;
            }
        }
    }
    return target;
}

function generateNumber(value: number): string {

    if (value !== value) {
        throw new Error('Numeric literal whose value is NaN');
    }
    if (value < 0 || (value === 0 && 1 / value < 0)) {
        throw new Error('Numeric literal whose value is negative');
    }

    if (value === 1 / 0) {
        return json ? 'null' : renumber ? '1e400' : '1e+400';
    }

    let result = '' + value;
    if (!renumber || result.length < 3) {
        return result;
    }

    let point = result.indexOf('.');
    if (!json && result.charCodeAt(0) === 0x30 /* 0 */ && point === 1) {
        point = 0;
        result = result.slice(1);
    }
    let temp = result;
    result = result.replace('e+', 'e');
    let exponent = 0;
    let pos: number;
    if ((pos = temp.indexOf('e')) > 0) {
        exponent = +temp.slice(pos + 1);
        temp = temp.slice(0, pos);
    }
    if (point >= 0) {
        exponent -= temp.length - point - 1;
        temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
    }
    pos = 0;
    while (temp.charCodeAt(temp.length + pos - 1) === 0x30 /* 0 */) {
        --pos;
    }
    if (pos !== 0) {
        exponent -= pos;
        temp = temp.slice(0, pos);
    }
    if (exponent !== 0) {
        temp += 'e' + exponent;
    }
    if (
        (temp.length < result.length ||
            (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length)) &&
        +temp === value
    ) {
        result = temp;
    }

    return result;
}

// Generate valid RegExp expression.
// This function is based on https://github.com/Constellation/iv Engine

function escapeRegExpCharacter(ch: number, previousIsBackslash: boolean) {
    // not handling '\' and handling \u2028 or \u2029 to unicode escape sequence
    if ((ch & ~1) === 0x2028) {
        return (previousIsBackslash ? 'u' : '\\u') + (ch === 0x2028 ? '2028' : '2029');
    } else if (ch === 10 || ch === 13) {
        // \n, \r
        return (previousIsBackslash ? '' : '\\') + (ch === 10 ? 'n' : 'r');
    }
    return String.fromCharCode(ch);
}

function generateRegExp(reg: RegExp): string {

    let result = reg.toString();

    if (reg.source) {
        // extract flag from toString result
        const match = result.match(/\/([^/]*)$/);
        if (!match) {
            return result;
        }

        const flags = match[1];
        result = '';

        let characterInBrack = false;
        let previousIsBackslash = false;
        for (let i = 0, iz = reg.source.length; i < iz; ++i) {
            const ch = reg.source.charCodeAt(i);

            if (!previousIsBackslash) {
                if (characterInBrack) {
                    if (ch === 93) {
                        // ]
                        characterInBrack = false;
                    }
                } else {
                    if (ch === 47) {
                        // /
                        result += '\\';
                    } else if (ch === 91) {
                        // [
                        characterInBrack = true;
                    }
                }
                result += escapeRegExpCharacter(ch, previousIsBackslash);
                previousIsBackslash = ch === 92; // \
            } else {
                // if new RegExp("\\\n') is provided, create /\n/
                result += escapeRegExpCharacter(ch, previousIsBackslash);
                // prevent like /\\[/]/
                previousIsBackslash = false;
            }
        }

        return '/' + result + '/' + flags;
    }

    return result;
}

function escapeAllowedCharacter(code: number, next: number) {

    if (code === 0x08 /* \b */) {
        return '\\b';
    }

    if (code === 0x0c /* \f */) {
        return '\\f';
    }

    if (code === 0x09 /* \t */) {
        return '\\t';
    }

    const hex = code.toString(16).toUpperCase();
    if (json || code > 0xff) {
        return '\\u' + '0000'.slice(hex.length) + hex;
    } else if (code === 0x0000 && !isDecimalDigit(next)) {
        return '\\0';
    } else if (code === 0x000b /* \v */) {
        // '\v'
        return '\\x0B';
    } else {
        return '\\x' + '00'.slice(hex.length) + hex;
    }
}

function escapeDisallowedCharacter(code: number) {
    if (code === 0x5c /* \ */) {
        return '\\\\';
    }

    if (code === 0x0a /* \n */) {
        return '\\n';
    }

    if (code === 0x0d /* \r */) {
        return '\\r';
    }

    if (code === 0x2028) {
        return '\\u2028';
    }

    if (code === 0x2029) {
        return '\\u2029';
    }

    throw new Error('Incorrectly classified character');
}

function escapeDirective(str: string) {

    let quote = quotes === 'double' ? '"' : "'";
    for (let i = 0, iz = str.length; i < iz; ++i) {
        const code = str.charCodeAt(i);
        if (code === 0x27 /* ' */) {
            quote = '"';
            break;
        } else if (code === 0x22 /* " */) {
            quote = "'";
            break;
        } else if (code === 0x5c /* \ */) {
            ++i;
        }
    }

    return quote + str + quote;
}

function escapeString(str: string): string {

    let result = '';
    let singleQuotes = 0;
    let doubleQuotes = 0;
    for (let i = 0, len = str.length; i < len; ++i) {
        const code = str.charCodeAt(i);
        if (code === 0x27 /* ' */) {
            ++singleQuotes;
        } else if (code === 0x22 /* " */) {
            ++doubleQuotes;
        } else if (code === 0x2f /* / */ && json) {
            result += '\\';
        } else if (isLineTerminator(code) || code === 0x5c /* \ */) {
            result += escapeDisallowedCharacter(code);
            continue;
        } else if ((json && code < 0x20) /* SP */ || !(json || escapeless || (code >= 0x20 /* SP */ && code <= 0x7e) /* ~ */)) {
            result += escapeAllowedCharacter(code, str.charCodeAt(i + 1));
            continue;
        }
        result += String.fromCharCode(code);
    }

    const single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));
    const quote = single ? "'" : '"';

    if (!(single ? singleQuotes : doubleQuotes)) {
        return quote + result + quote;
    }

    str = result;
    result = quote;

    for (let i = 0, len = str.length; i < len; ++i) {
        const code = str.charCodeAt(i);
        if ((code === 0x27 /* ' */ && single) || (code === 0x22 /* " */ && !single)) {
            result += '\\';
        }
        result += String.fromCharCode(code);
    }

    return result + quote;
}

/**
 * flatten an array to a string, where the array can contain
 * either strings or nested arrays
 */
function flattenToString(arr: CODEOUT[]): string {
    let result = '';
    for (let i = 0, iz = arr.length; i < iz; ++i) {
        const elem = arr[i];
        result += Array.isArray(elem) ? flattenToString(elem) : elem;
    }
    return result;
}

type TO_SOURCE_NODE_OUTPUT = SourceNode | string

/**
 * convert generated to a SourceNode when source maps are enabled.
 */
function toSourceNodeWhenNeeded(generated: CODEOUT, node?: Identifier | Expression): string | SourceNode {
    if (!sourceMap) {
        // with no source maps, generated is either an
        // array or a string.  if an array, flatten it.
        // if a string, just return it
        if (Array.isArray(generated)) {
            return flattenToString(generated);
        } else {
            if (typeof generated === 'string') {
                return generated;
            } else {
                throw new Error(`Unexpected ${JSON.stringify(generated)}`);
            }
        }
    } else {
        if (node == null) {
            if (generated instanceof SourceNode) {
                return generated;
            } else {
                return new SourceNode(null, null, sourceMap, generated as string | string[], null);
            }
        } else {
            if (node.loc) {
                const loc = node.loc;
                const start = loc.start;
                // Ignore the name issue because we aren't doing source maps.
                return new SourceNode(start.line, start.column, sourceMap === true ? loc.source || null : sourceMap, generated as string | string[], /*node.name ||*/ null);
            } else {
                // Ignore the name issue because we aren't doing source maps.
                return new SourceNode(null, null, sourceMap, generated as string | string[], /*node.name ||*/ null);
            }
        }
    }
}

/**
 * Returns at least a single space if the module level space (string) variable is falsey.
 */
function noEmptySpace(): string {
    return space ? space : ' ';
}

type JOIN_INPUT = CODEOUT
type JOIN_OUTPUT = [JOIN_INPUT] | [JOIN_INPUT, string, JOIN_INPUT] | [JOIN_INPUT, JOIN_INPUT]

function join(left: JOIN_INPUT, right: JOIN_INPUT): JOIN_OUTPUT {

    const leftSource = toSourceNodeWhenNeeded(left).toString();
    if (leftSource.length === 0) {
        return [right];
    }

    const rightSource = toSourceNodeWhenNeeded(right).toString();
    if (rightSource.length === 0) {
        return [left];
    }

    const leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
    const rightCharCode = rightSource.charCodeAt(0);

    if (
        ((leftCharCode === 0x2b /* + */ || leftCharCode === 0x2d) /* - */ && leftCharCode === rightCharCode) ||
        (isIdentifierPart(leftCharCode) && isIdentifierPart(rightCharCode)) ||
        (leftCharCode === 0x2f /* / */ && rightCharCode === 0x69) /* i */
    ) {
        // infix word operators all start with `i`
        return [left, noEmptySpace(), right];
    } else if (isWhiteSpace(leftCharCode) || isLineTerminator(leftCharCode) || isWhiteSpace(rightCharCode) || isLineTerminator(rightCharCode)) {
        return [left, right];
    }
    return [left, space, right];
}

type ADD_INDENT_INPUT = CODEOUT;
type ADD_INDENT_OUTPUT = [string, ADD_INDENT_INPUT];

type MAYBE_BLOCK_OUTPUT = TO_SOURCE_NODE_OUTPUT[] | ';' | [string, ADD_INDENT_OUTPUT];

function addIndent(stmt: ADD_INDENT_INPUT): ADD_INDENT_OUTPUT {
    return [base, stmt];
}

function withIndent(fn: (base: string) => unknown) {
    const previousBase = base;
    base += indent;
    fn(base);
    base = previousBase;
}

function calculateSpaces(str: string): number {
    let i: number;
    for (i = str.length - 1; i >= 0; --i) {
        if (isLineTerminator(str.charCodeAt(i))) {
            break;
        }
    }
    return str.length - 1 - i;
}

function adjustMultilineComment(value: string, specialBase?: string): string {

    const array: string[] = value.split(/\r\n|[\r\n]/);
    let spaces = Number.MAX_VALUE;

    // first line doesn't have indentation
    for (let i = 1, len = array.length; i < len; ++i) {
        const line = array[i];
        let j = 0;
        while (j < line.length && isWhiteSpace(line.charCodeAt(j))) {
            ++j;
        }
        if (spaces > j) {
            spaces = j;
        }
    }

    let previousBase: string;
    if (typeof specialBase !== 'undefined') {
        // pattern like
        // {
        //   var t = 20;  /*
        //                 * this is comment
        //                 */
        // }
        previousBase = base;
        if (array[1][spaces] === '*') {
            specialBase += ' ';
        }
        base = specialBase;
    } else {
        if (spaces & 1) {
            // /*
            //  *
            //  */
            // If spaces are odd number, above pattern is considered.
            // We waste 1 space.
            --spaces;
        }
        previousBase = base;
    }

    for (let i = 1, len = array.length; i < len; ++i) {
        const sn = toSourceNodeWhenNeeded(addIndent(array[i].slice(spaces)));
        if (sourceMap) {
            // TODO: Definitely some risky behavior here.
            array[i] = (sn as SourceNode).join('') as unknown as string;
        }
        else {
            array[i] = sn as string;
        }
    }

    base = previousBase;

    return array.join('\n');
}

function generateComment(comment: Comment, specialBase?: string) {
    if (comment.type === 'Line') {
        if (endsWithLineTerminator(comment.value)) {
            return '//' + comment.value;
        } else {
            // Always use LineTerminator
            let result = '//' + comment.value;
            if (!preserveBlankLines) {
                result += '\n';
            }
            return result;
        }
    }
    if (extra.format.indent.adjustMultilineComment && /[\n\r]/.test(comment.value)) {
        return adjustMultilineComment('/*' + comment.value + '*/', specialBase);
    }
    return '/*' + comment.value + '*/';
}

function addComments(stmt: Statement | BlockStatement | Expression, result: CODEOUT[]) {
    // var i, len, comment, save, tailingToStatement, specialBase, fragment, extRange, range, prevRange, prefix, infix, suffix, count;

    if (stmt.leadingComments && stmt.leadingComments.length > 0) {
        const save = result;

        if (preserveBlankLines) {
            const comment = stmt.leadingComments[0];
            result = [];

            const extRange = comment.extendedRange;
            const range = comment.range;

            const prefix = sourceCode.substring(extRange[0], range[0]);
            const prefixCount = (prefix.match(/\n/g) || []).length;
            if (prefixCount > 0) {
                result.push(stringRepeat('\n', prefixCount));
                result.push(addIndent(generateComment(comment)));
            } else {
                result.push(prefix);
                result.push(generateComment(comment));
            }

            let prevRange = range;

            for (let i = 1, len = stmt.leadingComments.length; i < len; i++) {
                const comment = stmt.leadingComments[i];
                const range = comment.range;

                const infix = sourceCode.substring(prevRange[1], range[0]);
                const count = (infix.match(/\n/g) || []).length;
                result.push(stringRepeat('\n', count));
                result.push(addIndent(generateComment(comment)));

                prevRange = range;
            }

            const suffix = sourceCode.substring(range[1], extRange[1]);
            const suffixCount = (suffix.match(/\n/g) || []).length;
            result.push(stringRepeat('\n', suffixCount));
        } else {
            const comment = stmt.leadingComments[0];
            result = [];
            if (safeConcatenation && isProgram(stmt) && stmt.body.length === 0) {
                result.push('\n');
            }
            result.push(generateComment(comment));
            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                result.push('\n');
            }

            for (let i = 1, len = stmt.leadingComments.length; i < len; ++i) {
                const comment = stmt.leadingComments[i];
                const fragment = [generateComment(comment)];
                if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                    fragment.push('\n');
                }
                result.push(addIndent(fragment));
            }
        }

        result.push(addIndent(save));
    }

    if (stmt.trailingComments) {
        if (preserveBlankLines) {
            const comment = stmt.trailingComments[0];
            const extRange = comment.extendedRange;
            const range = comment.range;

            const prefix = sourceCode.substring(extRange[0], range[0]);
            const count = (prefix.match(/\n/g) || []).length;

            if (count > 0) {
                result.push(stringRepeat('\n', count));
                result.push(addIndent(generateComment(comment)));
            } else {
                result.push(prefix);
                result.push(generateComment(comment));
            }
        } else {
            const tailingToStatement = !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());
            const specialBase = stringRepeat(' ', calculateSpaces(toSourceNodeWhenNeeded([base, result, indent]).toString()));
            for (let i = 0, len = stmt.trailingComments.length; i < len; ++i) {
                const comment = stmt.trailingComments[i];
                if (tailingToStatement) {
                    // We assume target like following script
                    //
                    // var t = 20;  /**
                    //               * This is comment of t
                    //               */
                    if (i === 0) {
                        // first case
                        result = [result, indent];
                    } else {
                        result = [result, specialBase];
                    }
                    result.push(generateComment(comment, specialBase));
                } else {
                    result = [result, addIndent(generateComment(comment))];
                }
                if (i !== len - 1 && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                    result = [result, '\n'];
                }
            }
        }
    }

    return result;
}

function generateBlankLines(start: number, end: number, result: CODEOUT[]): void {
    let newlineCount = 0;
    for (let j = start; j < end; j++) {
        if (sourceCode[j] === '\n') {
            newlineCount++;
        }
    }
    for (let j = 1; j < newlineCount; j++) {
        result.push(newline);
    }
}

function parenthesize(text: string | CODEOUT[], current: number, should: number) {
    if (current < should) {
        return ['(', text, ')'];
    }
    return text;
}

function generateVerbatimString(str: string): string[] {
    const result = str.split(/\r\n|\n/);
    for (let i = 1, iz = result.length; i < iz; i++) {
        result[i] = newline + base + result[i];
    }
    return result;
}

interface Verbatim {
    content: string;
    precedence: number;
}

function generateVerbatim(expr: Expression, precedence: number) {
    const verbatim = (expr as unknown as { [vebatim: string]: string | Verbatim })[extra.verbatim];

    if (typeof verbatim === 'string') {
        const result = parenthesize(generateVerbatimString(verbatim), Precedence.Sequence, precedence);
        return toSourceNodeWhenNeeded(result, expr);
    }
    else {
        // verbatim is object
        const resultOne = generateVerbatimString(verbatim.content);
        const prec = verbatim.precedence != null ? verbatim.precedence : Precedence.Sequence;
        const resultTwo = parenthesize(resultOne, prec, precedence);
        return toSourceNodeWhenNeeded(resultTwo, expr);
    }

}

/**
 * TODO: Since the node is always a Module or Script, te node type is always Program.
 * @param node 
 * @returns 
 */
function generateProgram(node: Module | Script) {
    // console.lg('generateInternal(node=...)');
    const codegen = new CodeGenerator();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (codegen.isStatement(node as any)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return codegen.generateStatement(node as any, S_TFFF);
    }
    if (codegen.isExpression(node)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return codegen.generateExpression(node as any, Precedence.Sequence, E_TTT);
    }
    throw new Error('Unknown node type: ' + node.type);
}

class CodeGenerator {
    //==============================================
    isExpression(node: Module | Script): boolean {
        switch (node.type) {
            default: {
                throw new Error(node.type);
            }
        }
    }

    SequenceExpression(expr: SequenceExpression, precedence: number, flags: number) {
        if (Precedence.Sequence < precedence) {
            flags |= F_ALLOW_IN;
        }
        const result: CODEOUT[] = [];
        for (let i = 0, iz = expr.expressions.length; i < iz; ++i) {
            result.push(this.generateExpression(expr.expressions[i], Precedence.Assignment, flags));
            if (i + 1 < iz) {
                result.push(',' + space);
            }
        }
        return parenthesize(result, Precedence.Sequence, precedence);
    }
    AssignmentExpression(expr: AssignmentExpression, precedence: number, flags: number) {
        return this.generateAssignment(expr.left, expr.right, expr.operator, precedence, flags);
    }
    ArrowFunctionExpression(expr: ArrowFunctionExpression, precedence: number) {
        return parenthesize(this.generateFunctionBody(expr), Precedence.ArrowFunction, precedence);
    }
    ConditionalExpression(expr: ConditionalExpression, precedence: number, flags: number) {
        if (Precedence.Conditional < precedence) {
            flags |= F_ALLOW_IN;
        }
        return parenthesize(
            [
                this.generateExpression(expr.test, Precedence.LogicalOR, flags),
                space + '?' + space,
                this.generateExpression(expr.consequent, Precedence.Assignment, flags),
                space + ':' + space,
                this.generateExpression(expr.alternate, Precedence.Assignment, flags),
            ],
            Precedence.Conditional,
            precedence
        );
    }
    LogicalExpression(expr: BinaryExpression, precedence: number, flags: number) {
        return this.BinaryExpression(expr, precedence, flags);
    }
    BinaryExpression(expr: BinaryExpression, precedence: number, flags: number) {

        const currentPrecedence = BinaryPrecedence[expr.operator];

        if (currentPrecedence < precedence) {
            flags |= F_ALLOW_IN;
        }

        const lhsFragment = this.generateExpression(expr.left, currentPrecedence, flags);
        const lhsSource = lhsFragment.toString();

        let result: CODEOUT[];
        if (lhsSource.charCodeAt(lhsSource.length - 1) === 0x2f /* / */ && isIdentifierPart(expr.operator.charCodeAt(0))) {
            result = [lhsFragment, noEmptySpace(), expr.operator];
        } else {
            result = join(lhsFragment, expr.operator);
        }

        const rhsFragment = this.generateExpression(expr.right, currentPrecedence + 1, flags);
        const rhsSource = rhsFragment.toString();

        if (
            (expr.operator === '/' && rhsSource.charAt(0) === '/') ||
            (expr.operator.slice(-1) === '<' && rhsSource.slice(0, 3) === '!--')
        ) {
            // If '/' concats with '/' or `<` concats with `!--`, it is interpreted as comment start
            result.push(noEmptySpace());
            result.push(rhsFragment);
        } else {
            result = join(result, rhsFragment);
        }

        if (expr.operator === 'in' && !(flags & F_ALLOW_IN)) {
            return ['(', result, ')'];
        }
        return parenthesize(result, currentPrecedence, precedence);
    }
    CallExpression(expr: CallExpression, precedence: number, flags: number) {
        // F_ALLOW_UNPARATH_NEW becomes false.
        const result = [this.generateExpression(expr.callee, Precedence.Call, E_TTF)];
        result.push('(');
        for (let i = 0, iz = expr['arguments'].length; i < iz; ++i) {
            result.push(this.generateExpression(expr['arguments'][i], Precedence.Assignment, E_TTT));
            if (i + 1 < iz) {
                result.push(',' + space);
            }
        }
        result.push(')');

        if (!(flags & F_ALLOW_CALL)) {
            return ['(', result, ')'];
        }
        return parenthesize(result, Precedence.Call, precedence);
    }
    NewExpression(expr: NewExpression, precedence: number, flags: number) {
        const length = expr['arguments'].length;

        // F_ALLOW_CALL becomes false.
        // F_ALLOW_UNPARATH_NEW may become false.
        const itemFlags = flags & F_ALLOW_UNPARATH_NEW && !parentheses && length === 0 ? E_TFT : E_TFF;

        const result = join('new', this.generateExpression(expr.callee, Precedence.New, itemFlags));

        if (!(flags & F_ALLOW_UNPARATH_NEW) || parentheses || length > 0) {
            result.push('(');
            for (let i = 0, iz = length; i < iz; ++i) {
                result.push(this.generateExpression(expr['arguments'][i], Precedence.Assignment, E_TTT));
                if (i + 1 < iz) {
                    result.push(',' + space);
                }
            }
            result.push(')');
        }

        return parenthesize(result, Precedence.New, precedence);
    }
    MemberExpression(expr: ComputedMemberExpression, precedence: number, flags: number) {

        // F_ALLOW_UNPARATH_NEW becomes false.
        const result: [TO_SOURCE_NODE_OUTPUT] = [this.generateExpression(expr.object, Precedence.Call, flags & F_ALLOW_CALL ? E_TTF : E_TFF)];

        if (expr.computed) {
            result.push('[');
            result.push(this.generateExpression(expr.property, Precedence.Sequence, flags & F_ALLOW_CALL ? E_TTT : E_TFT));
            result.push(']');
        } else {
            if (isLiteral(expr.object) && typeof expr.object.value === 'number') {
                const fragment = toSourceNodeWhenNeeded(result).toString();
                // When the following conditions are all true,
                //   1. No floating point
                //   2. Don't have exponents
                //   3. The last character is a decimal digit
                //   4. Not hexadecimal OR octal number literal
                // we should add a floating point.
                if (
                    fragment.indexOf('.') < 0 &&
                    !/[eExX]/.test(fragment) &&
                    isDecimalDigit(fragment.charCodeAt(fragment.length - 1)) &&
                    !(fragment.length >= 2 && fragment.charCodeAt(0) === 48) // '0'
                ) {
                    result.push('.');
                }
            }
            result.push('.');
            if (isIdentifier(expr.property)) {
                result.push(generateIdentifier(expr.property));
            }
            else {
                // This really should never happen.
                result.push(generateIdentifier(expr.property as Identifier));
            }
        }

        return parenthesize(result, Precedence.Member, precedence);
    }
    UnaryExpression(expr: UnaryExpression, precedence: number) {
        const fragment = this.generateExpression(expr.argument, Precedence.Unary, E_TTT);

        let result: CODEOUT[];
        if (space === '') {
            result = join(expr.operator, fragment);
        } else {
            result = [expr.operator];
            if (expr.operator.length > 2) {
                // delete, void, typeof
                // get `typeof []`, not `typeof[]`
                result = join(result, fragment);
            } else {
                // Prevent inserting spaces between operator and argument if it is unnecessary
                // like, `!cond`
                const leftSource = toSourceNodeWhenNeeded(result).toString();
                const leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
                const rightCharCode = fragment.toString().charCodeAt(0);

                if (
                    ((leftCharCode === 0x2b /* + */ || leftCharCode === 0x2d) /* - */ && leftCharCode === rightCharCode) ||
                    (isIdentifierPart(leftCharCode) && isIdentifierPart(rightCharCode))
                ) {
                    result.push(noEmptySpace());
                    result.push(fragment);
                } else {
                    result.push(fragment);
                }
            }
        }
        return parenthesize(result, Precedence.Unary, precedence);
    }
    YieldExpression(expr: YieldExpression, precedence: number) {
        let result: string | JOIN_OUTPUT;
        if (expr.delegate) {
            result = 'yield*';
        } else {
            result = 'yield';
        }
        if (expr.argument) {
            result = join(result, this.generateExpression(expr.argument, Precedence.Yield, E_TTT));
        }
        return parenthesize(result, Precedence.Yield, precedence);
    }
    AwaitExpression(expr: AwaitExpression, precedence: number) {
        const result = join(expr.delegate ? 'await*' : 'await', this.generateExpression(expr.argument, Precedence.Await, E_TTT));
        return parenthesize(result, Precedence.Await, precedence);
    }
    UpdateExpression(expr: UpdateExpression, precedence: number) {
        if (expr.prefix) {
            return parenthesize([expr.operator, this.generateExpression(expr.argument, Precedence.Unary, E_TTT)], Precedence.Unary, precedence);
        }
        return parenthesize([this.generateExpression(expr.argument, Precedence.Postfix, E_TTT), expr.operator], Precedence.Postfix, precedence);
    }
    FunctionExpression(expr: FunctionExpression) {
        const result: CODEOUT[] = [generateAsyncPrefix(expr, true), 'function'];
        if (expr.id) {
            result.push(generateStarSuffix(expr) || noEmptySpace());
            result.push(generateIdentifier(expr.id));
        } else {
            result.push(generateStarSuffix(expr) || space);
        }
        result.push(this.generateFunctionBody(expr));
        return result;
    }
    ExportBatchSpecifier() {
        return '*';
    }
    ArrayPattern(expr: ArrayPattern) {
        return this.ArrayExpression(expr);
    }
    ArrayExpression(expr: ArrayExpression) {
        if (!expr.elements.length) {
            return '[]';
        }
        const multiline = expr.elements.length > 1;
        const result: CODEOUT[] = ['[', multiline ? newline : ''];
        withIndent((indent) => {
            for (let i = 0, iz = expr.elements.length; i < iz; ++i) {
                if (!expr.elements[i]) {
                    if (multiline) {
                        result.push(indent);
                    }
                    if (i + 1 === iz) {
                        result.push(',');
                    }
                } else {
                    result.push(multiline ? indent : '');
                    result.push(this.generateExpression(expr.elements[i], Precedence.Assignment, E_TTT));
                }
                if (i + 1 < iz) {
                    result.push(',' + (multiline ? newline : space));
                }
            }
        });
        if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
            result.push(newline);
        }
        result.push(multiline ? base : '');
        result.push(']');
        return result;
    }
    ClassExpression(expr: ClassExpression) {
        let result: CODEOUT[] = ['class'];
        if (expr.id) {
            result = join(result, this.generateExpression(expr.id, Precedence.Sequence, E_TTT));
        }
        if (expr.superClass) {
            const fragment = join('extends', this.generateExpression(expr.superClass, Precedence.Assignment, E_TTT));
            result = join(result, fragment);
        }
        result.push(space);
        result.push(this.generateStatement(expr.body, S_TFFT));
        return result;
    }
    MethodDefinition(expr: MethodDefinition) {
        let result: CODEOUT[];
        if (expr['static']) {
            result = ['static' + space];
        } else {
            result = [];
        }
        if (expr.kind === 'get' || expr.kind === 'set') {
            const fragment = [join(expr.kind, this.generatePropertyKey(expr.key, expr.computed)), this.generateFunctionBody(expr.value)];
            return join(result, fragment);
        } else {
            const fragment = [generateMethodPrefix(expr), this.generatePropertyKey(expr.key, expr.computed), this.generateFunctionBody(expr.value)];
            return join(result, fragment);
        }
    }
    Property(expr: Property) {
        if (expr.kind === 'get' || expr.kind === 'set') {
            const prop = expr as unknown as MethodDefinition
            return [expr.kind, noEmptySpace(), this.generatePropertyKey(expr.key, expr.computed), this.generateFunctionBody(prop.value)];
        }

        if (expr.shorthand) {
            const value = expr.value;
            if (isAssignmentPattern(value)) {
                return this.AssignmentPattern(value, Precedence.Sequence, E_TTT);
            }
            return this.generatePropertyKey(expr.key, expr.computed);
        }

        if (expr.method) {
            const prop = expr as unknown as MethodDefinition
            return [generateMethodPrefix(prop), this.generatePropertyKey(expr.key, expr.computed), this.generateFunctionBody(prop.value)];
        }

        return [this.generatePropertyKey(expr.key, expr.computed), ':' + space, this.generateExpression(expr.value, Precedence.Assignment, E_TTT)];
    }
    ObjectExpression(expr: ObjectExpression) {

        if (!expr.properties.length) {
            return '{}';
        }
        const multiline = expr.properties.length > 1;

        let fragment: TO_SOURCE_NODE_OUTPUT;
        withIndent(() => {
            fragment = this.generateExpression(expr.properties[0], Precedence.Sequence, E_TTT);
        });

        if (!multiline) {
            // issues 4
            // Do not transform from
            //   dejavu.Class.declare({
            //       method2: function () {}
            //   });
            // to
            //   dejavu.Class.declare({method2: function () {
            //       }});
            if (!hasLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                return ['{', space, fragment, space, '}'];
            }
        }

        let result: (string | TO_SOURCE_NODE_OUTPUT)[]
        withIndent((indent) => {
            result = ['{', newline, indent, fragment];

            if (multiline) {
                result.push(',' + newline);
                for (let i = 1, iz = expr.properties.length; i < iz; ++i) {
                    result.push(indent);
                    result.push(this.generateExpression(expr.properties[i], Precedence.Sequence, E_TTT));
                    if (i + 1 < iz) {
                        result.push(',' + newline);
                    }
                }
            }
        });

        if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
            result.push(newline);
        }
        result.push(base);
        result.push('}');
        return result;
    }
    AssignmentPattern(expr: AssignmentPattern, precedence: number, flags: number) {
        return this.generateAssignment(expr.left, expr.right, '=', precedence, flags);
    }
    ObjectPattern(expr: ObjectPattern) {
        if (!expr.properties.length) {
            return '{}';
        }

        let multiline = false;
        if (expr.properties.length === 1) {
            const property = expr.properties[0] as Property;
            if (property.value.type !== Syntax.Identifier) {
                multiline = true;
            }
        } else {
            for (let i = 0, iz = expr.properties.length; i < iz; ++i) {
                const property = expr.properties[i] as Property;
                if (!property.shorthand) {
                    multiline = true;
                    break;
                }
            }
        }
        const result: CODEOUT[] = ['{', multiline ? newline : ''];

        withIndent((indent) => {
            for (let i = 0, iz = expr.properties.length; i < iz; ++i) {
                result.push(multiline ? indent : '');
                result.push(this.generateExpression(expr.properties[i], Precedence.Sequence, E_TTT));
                if (i + 1 < iz) {
                    result.push(',' + (multiline ? newline : space));
                }
            }
        });

        if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
            result.push(newline);
        }
        result.push(multiline ? base : '');
        result.push('}');
        return result;
    }
    ThisExpression() {
        return 'this';
    }
    Super() {
        return 'super';
    }
    Identifier(expr: Identifier) {
        return generateIdentifier(expr);
    }
    ImportDefaultSpecifier(expr: ImportDefaultSpecifier) {
        // DGH. Is this a bug? Should this be local property (was id)?
        return generateIdentifier(expr.local);
    }
    ImportNamespaceSpecifier(expr: ImportNamespaceSpecifier) {
        const result = ['*'];
        if (expr.local) {
            result.push(space + 'as' + noEmptySpace() + generateIdentifier(expr.local));
        }
        return result;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ImportSpecifier(expr: ImportSpecifier, precedence: number, flags: number): string[] {
        const imported = expr.imported;
        const result = [imported.name];
        const local = expr.local;
        if (local && local.name !== imported.name) {
            result.push(noEmptySpace() + 'as' + noEmptySpace() + generateIdentifier(local));
        }
        return result;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ExportSpecifier(expr: ExportSpecifier) {
        const local = expr.local;
        const result = [local.name];
        const exported = expr.exported;
        if (exported && exported.name !== local.name) {
            result.push(noEmptySpace() + 'as' + noEmptySpace() + generateIdentifier(exported));
        }
        return result;
    }
    Literal(expr: Literal) {
        // parse is not defined in the module because we disallow it in GenerateOptions.
        /*
        if (Object.prototype.hasOwnProperty.call(expr, 'raw') && parse && extra.raw) {
            try {
                // TODO: What is happening here?
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const raw = (parse(expr.raw).body[0] as any).expression;
                if (raw.type === Syntax.Literal) {
                    if (raw.value === expr.value) {
                        return expr.raw;
                    }
                }
            } catch (e) {
                // not use raw property
            }
        }
        */

        if (expr.value === null) {
            return 'null';
        }

        if (typeof expr.value === 'string') {
            return escapeString(expr.value);
        }

        if (typeof expr.value === 'number') {
            return generateNumber(expr.value);
        }

        if (typeof expr.value === 'boolean') {
            return expr.value ? 'true' : 'false';
        }

        return generateRegExp(expr.value);
    }
    GeneratorExpression(expr: { type: string, body: Expression, blocks: Expression[], filter: Expression }) {
        return this.ComprehensionExpression(expr);
    }
    ComprehensionExpression(expr: { type: string, body: Expression, blocks: Expression[], filter: Expression }) {
        // GeneratorExpression should be parenthesized with (...), ComprehensionExpression with [...]
        // Due to https://bugzilla.mozilla.org/show_bug.cgi?id=883468 position of expr.body can differ in Spidermonkey and ES6

        let result: CODEOUT[] = expr.type === Syntax.GeneratorExpression ? ['('] : ['['];

        if (extra.moz.comprehensionExpressionStartsWithAssignment) {
            const fragment = this.generateExpression(expr.body, Precedence.Assignment, E_TTT);
            result.push(fragment);
        }

        if (expr.blocks) {
            withIndent(() => {
                for (let i = 0, iz = expr.blocks.length; i < iz; ++i) {
                    const fragment = this.generateExpression(expr.blocks[i], Precedence.Sequence, E_TTT);
                    if (i > 0 || extra.moz.comprehensionExpressionStartsWithAssignment) {
                        result = join(result, fragment);
                    } else {
                        result.push(fragment);
                    }
                }
            });
        }

        if (expr.filter) {
            result = join(result, 'if' + space);
            const fragment = this.generateExpression(expr.filter, Precedence.Sequence, E_TTT);
            result = join(result, ['(', fragment, ')']);
        }

        if (!extra.moz.comprehensionExpressionStartsWithAssignment) {
            const fragment = this.generateExpression(expr.body, Precedence.Assignment, E_TTT);

            result = join(result, fragment);
        }

        result.push(expr.type === Syntax.GeneratorExpression ? ')' : ']');
        return result;
    }
    ComprehensionBlock(expr: { left: Expression, of: 'of' | 'in', right: Expression }) {
        let fragment: string | SourceNode | CODEOUT[];
        const left = expr.left;
        if (isVariableDeclaration(left)) {
            fragment = [left.kind, noEmptySpace(), this.generateStatement(left.declarations[0], S_FFFF)];
        } else {
            fragment = this.generateExpression(expr.left, Precedence.Call, E_TTT);
        }

        fragment = join(fragment, expr.of ? 'of' : 'in');
        fragment = join(fragment, this.generateExpression(expr.right, Precedence.Sequence, E_TTT));

        return ['for' + space + '(', fragment, ')'];
    }
    SpreadElement(expr: SpreadElement) {
        return ['...', this.generateExpression(expr.argument, Precedence.Assignment, E_TTT)];
    }
    TaggedTemplateExpression(expr: TaggedTemplateExpression, precedence: number, flags: number) {
        let itemFlags = E_TTF;
        if (!(flags & F_ALLOW_CALL)) {
            itemFlags = E_TFF;
        }
        const result = [this.generateExpression(expr.tag, Precedence.Call, itemFlags), this.generateExpression(expr.quasi, Precedence.Primary, E_FFT)];
        return parenthesize(result, Precedence.TaggedTemplate, precedence);
    }
    TemplateElement(expr: TemplateElement) {
        // Don't use "cooked". Since tagged template can use raw template
        // representation. So if we do so, it breaks the script semantics.
        return expr.value.raw;
    }
    TemplateLiteral(expr: TemplateLiteral) {

        const result: CODEOUT[] = ['`'];
        for (let i = 0, iz = expr.quasis.length; i < iz; ++i) {
            result.push(this.generateExpression(expr.quasis[i], Precedence.Primary, E_TTT));
            if (i + 1 < iz) {
                result.push('${' + space);
                result.push(this.generateExpression(expr.expressions[i], Precedence.Sequence, E_TTT));
                result.push(space + '}');
            }
        }
        result.push('`');
        return result;
    }
    ModuleSpecifier(expr: Literal) {
        return this.Literal(expr);
    }
    //==============================================
    // BEGIN OF STATEMENTS
    isStatement(node: ExportableNamedDeclaration | ExportableDefaultDeclaration): boolean {
        switch (node.type) {
            case 'Program': {
                return true;
            }
        }
        return false;
    }
    BlockStatement(stmt: BlockStatement, flags: number) {

        let result: CODEOUT[] = ['{', newline];

        withIndent(() => {
            // handle functions without any code
            if (stmt.body.length === 0 && preserveBlankLines) {
                const range = stmt.range;
                if (range[1] - range[0] > 2) {
                    const content = sourceCode.substring(range[0] + 1, range[1] - 1);
                    if (content[0] === '\n') {
                        result = ['{'];
                    }
                    result.push(content);
                }
            }

            let bodyFlags = S_TFFF;
            if (flags & F_FUNC_BODY) {
                bodyFlags |= F_DIRECTIVE_CTX;
            }

            for (let i = 0, iz = stmt.body.length; i < iz; ++i) {
                if (preserveBlankLines) {
                    // handle spaces before the first line
                    if (i === 0) {
                        if (stmt.body[0].leadingComments) {
                            const range = stmt.body[0].leadingComments[0].extendedRange;
                            const content = sourceCode.substring(range[0], range[1]);
                            if (content[0] === '\n') {
                                result = ['{'];
                            }
                        }
                        if (!stmt.body[0].leadingComments) {
                            generateBlankLines(stmt.range[0], stmt.body[0].range[0], result);
                        }
                    }

                    // handle spaces between lines
                    if (i > 0) {
                        if (!stmt.body[i - 1].trailingComments && !stmt.body[i].leadingComments) {
                            generateBlankLines(stmt.body[i - 1].range[1], stmt.body[i].range[0], result);
                        }
                    }
                }

                if (i === iz - 1) {
                    bodyFlags |= F_SEMICOLON_OPT;
                }

                let fragment: ADD_INDENT_OUTPUT | TO_SOURCE_NODE_OUTPUT;
                if (stmt.body[i].leadingComments && preserveBlankLines) {
                    fragment = this.generateStatement(stmt.body[i], bodyFlags);
                } else {
                    fragment = addIndent(this.generateStatement(stmt.body[i], bodyFlags));
                }

                result.push(fragment);
                if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                    if (preserveBlankLines && i < iz - 1) {
                        // don't add a new line if there are leading coments
                        // in the next statement
                        if (!stmt.body[i + 1].leadingComments) {
                            result.push(newline);
                        }
                    } else {
                        result.push(newline);
                    }
                }

                if (preserveBlankLines) {
                    // handle spaces after the last line
                    if (i === iz - 1) {
                        if (!stmt.body[i].trailingComments) {
                            generateBlankLines(stmt.body[i].range[1], stmt.range[1], result);
                        }
                    }
                }
            }
        });

        result.push(addIndent('}'));
        return result;
    }
    BreakStatement(stmt: BreakStatement, flags: number): CODEOUT | string {
        if (stmt.label) {
            return 'break ' + stmt.label.name + this.semicolon(flags);
        }
        return 'break' + this.semicolon(flags);
    }
    ContinueStatement(stmt: ContinueStatement, flags: number): CODEOUT | string {
        if (stmt.label) {
            return 'continue ' + stmt.label.name + this.semicolon(flags);
        }
        return 'continue' + this.semicolon(flags);
    }
    ClassBody(stmt: ClassBody) {
        const result: CODEOUT[] = ['{', newline]

        withIndent((indent) => {
            for (let i = 0, iz = stmt.body.length; i < iz; ++i) {
                result.push(indent);
                result.push(this.generateExpression(stmt.body[i], Precedence.Sequence, E_TTT));
                if (i + 1 < iz) {
                    result.push(newline);
                }
            }
        });

        if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
            result.push(newline);
        }
        result.push(base);
        result.push('}');
        return result;
    }
    ClassDeclaration(stmt: ClassDeclaration) {
        let result: CODEOUT[] = ['class ' + stmt.id.name];
        if (stmt.superClass) {
            const fragment = join('extends', this.generateExpression(stmt.superClass, Precedence.Assignment, E_TTT));
            result = join(result, fragment);
        }
        result.push(space);
        result.push(this.generateStatement(stmt.body, S_TFFT));
        return result;
    }
    DirectiveStatement(stmt: Directive, flags: number): CODEOUT | string {
        if (extra.raw && stmt.raw) {
            return stmt.raw + this.semicolon(flags);
        }
        return escapeDirective(stmt.directive) + this.semicolon(flags);
    }
    DoWhileStatement(stmt: DoWhileStatement, flags: number) {
        // Because `do 42 while (cond)` is Syntax Error. We need semicolon.
        const doPart = join('do', this.maybeBlock(stmt.body, S_TFFF));
        const result = this.maybeBlockSuffix(stmt.body, doPart);
        return join(result, ['while' + space + '(', this.generateExpression(stmt.test, Precedence.Sequence, E_TTT), ')' + this.semicolon(flags)]);
    }
    CatchClause(stmt: CatchClause) {
        let result: CODEOUT[];
        withIndent(() => {
            result = ['catch' + space + '(', this.generateExpression(stmt.param, Precedence.Sequence, E_TTT), ')'];

            if (stmt.guard) {
                const guard = this.generateExpression(stmt.guard, Precedence.Sequence, E_TTT);
                result.splice(2, 0, ' if ', guard);
            }
        });
        result.push(this.maybeBlock(stmt.body, S_TFFF));
        return result;
    }
    DebuggerStatement(_stmt: DebuggerStatement, flags: number): string {
        return 'debugger' + this.semicolon(flags);
    }
    EmptyStatement(): ';' {
        return ';';
    }
    ExportDefaultDeclaration(stmt: ExportDefaultDeclaration, flags: number) {

        const bodyFlags = flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF;

        // export default HoistableDeclaration[Default]
        // export default AssignmentExpression[In] ;
        const result = join(['export'], 'default');
        if (this.isStatement(stmt.declaration)) {
            return join(result, this.generateStatement(stmt.declaration, bodyFlags));
        } else {
            return join(result, this.generateExpression(stmt.declaration, Precedence.Assignment, E_TTT) + this.semicolon(flags));
        }
    }
    ExportNamedDeclaration(stmt: ExportNamedDeclaration, flags: number) {

        const bodyFlags = flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF;

        // export VariableStatement
        // export Declaration[Default]
        if (stmt.declaration) {
            return join(['export'], this.generateStatement(stmt.declaration, bodyFlags));
        }

        // export ExportClause[NoReference] FromClause ;
        // export ExportClause ;
        let result: CODEOUT[];
        if (stmt.specifiers) {
            if (stmt.specifiers.length === 0) {
                result = join(['export'], '{' + space + '}');
            } else if (stmt.specifiers[0].type === Syntax.ExportBatchSpecifier) {
                result = join(['export'], this.generateExpression(stmt.specifiers[0], Precedence.Sequence, E_TTT));
            } else {
                result = join(['export'], '{');
                withIndent((indent) => {
                    result.push(newline);
                    for (let i = 0, iz = stmt.specifiers.length; i < iz; ++i) {
                        result.push(indent);
                        result.push(this.generateExpression(stmt.specifiers[i], Precedence.Sequence, E_TTT));
                        if (i + 1 < iz) {
                            result.push(',' + newline);
                        }
                    }
                });
                if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                    result.push(newline);
                }
                result.push(base + '}');
            }

            if (stmt.source) {
                result = join(result, [
                    'from' + space,
                    // ModuleSpecifier
                    this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
                    this.semicolon(flags),
                ]);
            } else {
                result.push(this.semicolon(flags));
            }
        }
        return result;
    }
    ExportAllDeclaration(stmt: ExportAllDeclaration, flags: number) {
        // export * FromClause ;
        return [
            'export' + space,
            '*' + space,
            'from' + space,
            // ModuleSpecifier
            this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
            this.semicolon(flags),
        ];
    }
    ExpressionStatement(stmt: ExpressionStatement, flags: number) {
        function isClassPrefixed(fragment: string) {
            if (fragment.slice(0, 5) !== 'class') {
                return false;
            }
            const code = fragment.charCodeAt(5);
            return code === 0x7b /* '{' */ || isWhiteSpace(code) || isLineTerminator(code);
        }

        function isFunctionPrefixed(fragment: string) {
            if (fragment.slice(0, 8) !== 'function') {
                return false;
            }
            const code = fragment.charCodeAt(8);
            return code === 0x28 /* '(' */ || isWhiteSpace(code) || code === 0x2a /* '*' */ || isLineTerminator(code);
        }

        function isAsyncPrefixed(fragment: string) {
            if (fragment.slice(0, 5) !== 'async') {
                return false;
            }
            if (!isWhiteSpace(fragment.charCodeAt(5))) {
                return false;
            }
            let i: number;
            let iz: number;
            for (i = 6, iz = fragment.length; i < iz; ++i) {
                if (!isWhiteSpace(fragment.charCodeAt(i))) {
                    break;
                }
            }
            if (i === iz) {
                return false;
            }
            if (fragment.slice(i, i + 8) !== 'function') {
                return false;
            }
            const code = fragment.charCodeAt(i + 8);
            return code === 0x28 /* '(' */ || isWhiteSpace(code) || code === 0x2a /* '*' */ || isLineTerminator(code);
        }

        let result: CODEOUT[] = [this.generateExpression(stmt.expression, Precedence.Sequence, E_TTT)];
        // 12.4 '{', 'function', 'class' is not allowed in this position.
        // wrap expression with parentheses
        const fragment = toSourceNodeWhenNeeded(result).toString();
        if (
            fragment.charCodeAt(0) === 0x7b /* '{' */ || // ObjectExpression
            isClassPrefixed(fragment) ||
            isFunctionPrefixed(fragment) ||
            isAsyncPrefixed(fragment) ||
            (directive && flags & F_DIRECTIVE_CTX && isLiteral(stmt.expression) && typeof stmt.expression.value === 'string')
        ) {
            result = ['(', result, ')' + this.semicolon(flags)];
        } else {
            result.push(this.semicolon(flags));
        }
        return result;
    }
    ImportDeclaration(stmt: ImportDeclaration, flags: number) {
        // ES6: 15.2.1 valid import declarations:
        //     - import ImportClause FromClause ;
        //     - import ModuleSpecifier ;

        // If no ImportClause is present,
        // this should be `import ModuleSpecifier` so skip `from`
        // ModuleSpecifier is StringLiteral.
        if (stmt.specifiers.length === 0) {
            // import ModuleSpecifier ;
            return [
                'import',
                space,
                // ModuleSpecifier
                this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
                this.semicolon(flags),
            ];
        }

        // import ImportClause FromClause ;
        let result: (string | TO_SOURCE_NODE_OUTPUT)[] | JOIN_OUTPUT = ['import'];
        let cursor = 0;

        // ImportedBinding
        if (stmt.specifiers[cursor].type === Syntax.ImportDefaultSpecifier) {
            result = join(result, [this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT)]);
            ++cursor;
        }

        if (stmt.specifiers[cursor]) {
            if (cursor !== 0) {
                result.push(',');
            }

            if (stmt.specifiers[cursor].type === Syntax.ImportNamespaceSpecifier) {
                // NameSpaceImport
                result = join(result, [space, this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT)]);
            } else {
                // NamedImports
                result.push(space + '{');

                if (stmt.specifiers.length - cursor === 1) {
                    // import { ... } from "...";
                    result.push(space);
                    result.push(this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT));
                    result.push(space + '}' + space);
                } else {
                    // import {
                    //    ...,
                    //    ...,
                    // } from "...";
                    withIndent((indent) => {
                        result.push(newline);
                        for (let i = cursor, iz = stmt.specifiers.length; i < iz; ++i) {
                            result.push(indent);
                            result.push(this.generateExpression(stmt.specifiers[i], Precedence.Sequence, E_TTT));
                            if (i + 1 < iz) {
                                result.push(',' + newline);
                            }
                        }
                    });
                    if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                        result.push(newline);
                    }
                    result.push(base + '}' + space);
                }
            }
        }

        result = join(result, [
            'from' + space,
            // ModuleSpecifier
            this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
            this.semicolon(flags),
        ]);
        return result;
    }
    VariableDeclarator(stmt: VariableDeclarator, flags: number) {
        const itemFlags = flags & F_ALLOW_IN ? E_TTT : E_FTT;
        if (stmt.init) {
            return [
                this.generateExpression(stmt.id, Precedence.Assignment, itemFlags),
                space,
                '=',
                space,
                this.generateExpression(stmt.init, Precedence.Assignment, itemFlags),
            ];
        }
        return this.generatePattern(stmt.id, Precedence.Assignment, itemFlags);
    }
    VariableDeclaration(stmt: VariableDeclaration, flags: number) {
        // VariableDeclarator is typed as Statement,
        // but joined with comma (not LineTerminator).
        // So if comment is attached to target node, we should specialize.
        const result: CODEOUT[] = [stmt.kind];

        const bodyFlags = flags & F_ALLOW_IN ? S_TFFF : S_FFFF;

        const block = () => {
            let node = stmt.declarations[0];
            if (extra.comment && node.leadingComments) {
                result.push('\n');
                result.push(addIndent(this.generateStatement(node, bodyFlags)));
            } else {
                result.push(noEmptySpace());
                result.push(this.generateStatement(node, bodyFlags));
            }

            for (let i = 1, iz = stmt.declarations.length; i < iz; ++i) {
                node = stmt.declarations[i];
                if (extra.comment && node.leadingComments) {
                    result.push(',' + newline);
                    result.push(addIndent(this.generateStatement(node, bodyFlags)));
                } else {
                    result.push(',' + space);
                    result.push(this.generateStatement(node, bodyFlags));
                }
            }
        }

        if (stmt.declarations.length > 1) {
            withIndent(block);
        } else {
            block();
        }

        result.push(this.semicolon(flags));

        return result;
    }
    ThrowStatement(stmt: ThrowStatement, flags: number) {
        return [join('throw', this.generateExpression(stmt.argument, Precedence.Sequence, E_TTT)), this.semicolon(flags)];
    }
    TryStatement(stmt: TryStatement) {
        let result: CODEOUT[] = ['try', this.maybeBlock(stmt.block, S_TFFF)];
        result = this.maybeBlockSuffix(stmt.block, result);

        if (stmt.handlers) {
            // old interface
            for (let i = 0, iz = stmt.handlers.length; i < iz; ++i) {
                result = join(result, this.generateStatement(stmt.handlers[i], S_TFFF));
                if (stmt.finalizer || i + 1 !== iz) {
                    result = this.maybeBlockSuffix(stmt.handlers[i].body, result);
                }
            }
        } else {
            const guardedHandlers = stmt.guardedHandlers || [];

            for (let i = 0, iz = guardedHandlers.length; i < iz; ++i) {
                result = join(result, this.generateStatement(guardedHandlers[i], S_TFFF));
                if (stmt.finalizer || i + 1 !== iz) {
                    result = this.maybeBlockSuffix(guardedHandlers[i].body, result);
                }
            }

            // new interface
            if (stmt.handler) {
                if (Array.isArray(stmt.handler)) {
                    for (let i = 0, iz = stmt.handler.length; i < iz; ++i) {
                        result = join(result, this.generateStatement(stmt.handler[i], S_TFFF));
                        if (stmt.finalizer || i + 1 !== iz) {
                            result = this.maybeBlockSuffix(stmt.handler[i].body, result);
                        }
                    }
                } else {
                    result = join(result, this.generateStatement(stmt.handler, S_TFFF));
                    if (stmt.finalizer) {
                        result = this.maybeBlockSuffix(stmt.handler.body, result);
                    }
                }
            }
        }
        if (stmt.finalizer) {
            result = join(result, ['finally', this.maybeBlock(stmt.finalizer, S_TFFF)]);
        }
        return result;
    }
    SwitchStatement(stmt: SwitchStatement) {
        let result: CODEOUT[];
        withIndent(() => {
            result = ['switch' + space + '(', this.generateExpression(stmt.discriminant, Precedence.Sequence, E_TTT), ')' + space + '{' + newline];
        });
        if (stmt.cases) {
            let bodyFlags = S_TFFF;
            for (let i = 0, iz = stmt.cases.length; i < iz; ++i) {
                if (i === iz - 1) {
                    bodyFlags |= F_SEMICOLON_OPT;
                }
                const fragment = addIndent(this.generateStatement(stmt.cases[i], bodyFlags));
                result.push(fragment);
                if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                    result.push(newline);
                }
            }
        }
        result.push(addIndent('}'));
        return result;
    }
    SwitchCase(stmt: SwitchCase, flags: number) {
        let result: CODEOUT[];
        withIndent(() => {
            if (stmt.test) {
                result = [join('case', this.generateExpression(stmt.test, Precedence.Sequence, E_TTT)), ':'];
            } else {
                result = ['default:'];
            }

            let i = 0;
            const iz = stmt.consequent.length;
            if (iz && stmt.consequent[0].type === Syntax.BlockStatement) {
                const fragment = this.maybeBlock(stmt.consequent[0], S_TFFF);
                result.push(fragment);
                i = 1;
            }

            if (i !== iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                result.push(newline);
            }

            let bodyFlags = S_TFFF;
            for (; i < iz; ++i) {
                if (i === iz - 1 && flags & F_SEMICOLON_OPT) {
                    bodyFlags |= F_SEMICOLON_OPT;
                }
                const fragment = addIndent(this.generateStatement(stmt.consequent[i], bodyFlags));
                result.push(fragment);
                if (i + 1 !== iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                    result.push(newline);
                }
            }
        });
        return result;
    }
    IfStatement(stmt: IfStatement, flags: number) {
        let result: CODEOUT[]
        withIndent(() => {
            result = ['if' + space + '(', this.generateExpression(stmt.test, Precedence.Sequence, E_TTT), ')'];
        });
        const semicolonOptional = flags & F_SEMICOLON_OPT;
        let bodyFlags = S_TFFF;
        if (semicolonOptional) {
            bodyFlags |= F_SEMICOLON_OPT;
        }
        if (stmt.alternate) {
            result.push(this.maybeBlock(stmt.consequent, S_TFFF));
            result = this.maybeBlockSuffix(stmt.consequent, result);
            if (stmt.alternate.type === Syntax.IfStatement) {
                result = join(result, ['else ', this.generateStatement(stmt.alternate, bodyFlags)]);
            } else {
                result = join(result, join('else', this.maybeBlock(stmt.alternate, bodyFlags)));
            }
        } else {
            result.push(this.maybeBlock(stmt.consequent, bodyFlags));
        }
        return result;
    }
    ForStatement(stmt: ForStatement, flags: number) {
        let result: CODEOUT[];
        withIndent(() => {
            result = ['for' + space + '('];
            if (stmt.init) {
                if (stmt.init.type === Syntax.VariableDeclaration) {
                    result.push(this.generateStatement(stmt.init, S_FFFF));
                } else {
                    // F_ALLOW_IN becomes false.
                    result.push(this.generateExpression(stmt.init, Precedence.Sequence, E_FTT));
                    result.push(';');
                }
            } else {
                result.push(';');
            }

            if (stmt.test) {
                result.push(space);
                result.push(this.generateExpression(stmt.test, Precedence.Sequence, E_TTT));
                result.push(';');
            } else {
                result.push(';');
            }

            if (stmt.update) {
                result.push(space);
                result.push(this.generateExpression(stmt.update, Precedence.Sequence, E_TTT));
                result.push(')');
            } else {
                result.push(')');
            }
        });

        result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
        return result;
    }
    ForInStatement(stmt: ForInStatement, flags: number) {
        return this.generateIterationForStatement('in', stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
    }
    ForOfStatement(stmt: ForOfStatement, flags: number) {
        return this.generateIterationForStatement('of', stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
    }
    LabeledStatement(stmt: LabeledStatement, flags: number) {
        return [stmt.label.name + ':', this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF)];
    }
    Program(stmt: Module | Script) {
        const iz = stmt.body.length;
        const result: CODEOUT[] = [safeConcatenation && iz > 0 ? '\n' : ''];
        let bodyFlags = S_TFTF;
        for (let i = 0; i < iz; ++i) {
            if (!safeConcatenation && i === iz - 1) {
                bodyFlags |= F_SEMICOLON_OPT;
            }

            if (preserveBlankLines) {
                // handle spaces before the first line
                if (i === 0) {
                    if (!stmt.body[0].leadingComments) {
                        generateBlankLines(stmt.range[0], stmt.body[i].range[0], result);
                    }
                }

                // handle spaces between lines
                if (i > 0) {
                    if (!stmt.body[i - 1].trailingComments && !stmt.body[i].leadingComments) {
                        generateBlankLines(stmt.body[i - 1].range[1], stmt.body[i].range[0], result);
                    }
                }
            }

            const fragment = addIndent(this.generateStatement(stmt.body[i], bodyFlags));
            result.push(fragment);
            if (i + 1 < iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                if (preserveBlankLines) {
                    if (!stmt.body[i + 1].leadingComments) {
                        result.push(newline);
                    }
                } else {
                    result.push(newline);
                }
            }

            if (preserveBlankLines) {
                // handle spaces after the last line
                if (i === iz - 1) {
                    if (!stmt.body[i].trailingComments) {
                        generateBlankLines(stmt.body[i].range[1], stmt.range[1], result);
                    }
                }
            }
        }
        return result;
    }
    FunctionDeclaration(stmt: FunctionDeclaration) {
        return [
            generateAsyncPrefix(stmt, true),
            'function',
            generateStarSuffix(stmt) || noEmptySpace(),
            generateIdentifier(stmt.id),
            this.generateFunctionBody(stmt),
        ];
    }
    ReturnStatement(stmt: ReturnStatement, flags: number) {
        if (stmt.argument) {
            return [join('return', this.generateExpression(stmt.argument, Precedence.Sequence, E_TTT)), this.semicolon(flags)];
        }
        return ['return' + this.semicolon(flags)];
    }
    WhileStatement(stmt: WhileStatement, flags: number) {
        let result: CODEOUT[]
        withIndent(() => {
            result = ['while' + space + '(', this.generateExpression(stmt.test, Precedence.Sequence, E_TTT), ')'];
        });
        result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
        return result;
    }
    WithStatement(stmt: WithStatement, flags: number) {
        let result: CODEOUT[];
        withIndent(() => {
            result = ['with' + space + '(', this.generateExpression(stmt.object, Precedence.Sequence, E_TTT), ')'];
        });
        result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
        return result;
    }
    // END OF STATEMENTS
    //==============================================

    generateFunctionParams(node: FunctionDeclaration | FunctionExpression | ArrowFunctionExpression) {
        let result: CODEOUT[];

        let hasDefault = false;

        if (isArrowFunctionExpression(node) &&
            !node.rest &&
            (!node.defaults || node.defaults.length === 0) &&
            node.params.length === 1 &&
            isIdentifier(node.params[0])
        ) {
            // arg => { } case
            result = [generateAsyncPrefix(node, true), generateIdentifier(node.params[0])];
        } else {
            result = isArrowFunctionExpression(node) ? [generateAsyncPrefix(node, false)] : [];
            result.push('(');
            if (node.defaults) {
                hasDefault = true;
            }
            for (let i = 0, iz = node.params.length; i < iz; ++i) {
                if (hasDefault && node.defaults[i]) {
                    // Handle default values.
                    result.push(this.generateAssignment(node.params[i], node.defaults[i], '=', Precedence.Assignment, E_TTT));
                } else {
                    result.push(this.generatePattern(node.params[i], Precedence.Assignment, E_TTT));
                }
                if (i + 1 < iz) {
                    result.push(',' + space);
                }
            }

            if (node.rest) {
                if (node.params.length) {
                    result.push(',' + space);
                }
                result.push('...');
                result.push(generateIdentifier(node.rest));
            }

            result.push(')');
        }

        return result;
    }

    generatePattern(node: Expression, precedence: number, flags: number) {
        if (isIdentifier(node)) {
            return generateIdentifier(node);
        }
        return this.generateExpression(node, precedence, flags);
    }

    generateStatement(stmt: Statement | BlockStatement, flags: number) {
        // console.lg(`CodeGenerator.generateStatement(stmt=${JSON.stringify(stmt)}, flags=${JSON.stringify(flags)})`);

        let result: CODEOUT[] = (this as unknown as { [name: string]: (stmt: Statement | BlockStatement, flags: number) => CODEOUT[] })[stmt.type](stmt, flags);

        // Attach comments

        if (extra.comment) {
            result = addComments(stmt, result);
        }

        const fragment = toSourceNodeWhenNeeded(result).toString();
        if (stmt.type === Syntax.Program && !safeConcatenation && newline === '' && fragment.charAt(fragment.length - 1) === '\n') {
            if (sourceMap) {
                console.log(`CodeGenerator.generateStatement(stmt=${JSON.stringify(stmt)}, flags=${JSON.stringify(flags)})`);
                const sourceNode = toSourceNodeWhenNeeded(result) as SourceNode;
                const munged = sourceNode.replaceRight(/\s+$/, '');
                return toSourceNodeWhenNeeded(munged, stmt);
            }
            else {
                return toSourceNodeWhenNeeded(fragment.replace(/\s+$/, ''), stmt);
            }
        } else {
            return toSourceNodeWhenNeeded(result, stmt);
        }
    }

    generateExpression(expr: Expression, precedence: number, flags: number) {
        // console.lg(`CodeGenerator.generateExpression(expr=${JSON.stringify(expr)}, precedence=${precedence}, flags=${JSON.stringify(flags)})`);
        const type = expr.type || Syntax.Property;

        if (extra.verbatim && Object.prototype.hasOwnProperty.call(expr, extra.verbatim)) {
            return generateVerbatim(expr, precedence);
        }

        const target = (this as unknown as { [name: string]: () => unknown })[type];
        if (typeof target === 'function') {
            // WARNING: Make sure to essentially call this[type] to ensure the scope is correct.            
            let result: CODEOUT[] = (this as unknown as { [name: string]: (expr: Expression, precedence: number, flags: number) => CODEOUT[] })[type](expr, precedence, flags);

            if (extra.comment) {
                result = addComments(expr, result);
            }
            return toSourceNodeWhenNeeded(result, expr);
        } else {
            const msg = `CodeGenerator.generateExpression(expr=..., precedence=..., flags=...): this[type], where type=${JSON.stringify(
                type
            )} is not a function.`;
            throw new Error(msg);
        }
    }

    maybeBlock(stmt: Expression | BlockStatement, flags: number): MAYBE_BLOCK_OUTPUT {

        const noLeadingComment = !extra.comment || !stmt.leadingComments;

        if (stmt.type === Syntax.BlockStatement && noLeadingComment) {
            return [space, this.generateStatement(stmt, flags)];
        }

        if (stmt.type === Syntax.EmptyStatement && noLeadingComment) {
            // DGH Is this a bug??
            return ';';
        }

        let result: [string, ADD_INDENT_OUTPUT];
        withIndent(() => {
            result = [newline, addIndent(this.generateStatement(stmt, flags))];
        });

        return result;
    }

    maybeBlockSuffix(stmt: Statement, result: CODEOUT[]) {
        const ends = endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());
        if (stmt.type === Syntax.BlockStatement && (!extra.comment || !stmt.leadingComments) && !ends) {
            return [result, space];
        }
        if (ends) {
            return [result, base];
        }
        return [result, newline, base];
    }

    generateFunctionBody(node: FunctionDeclaration | FunctionExpression | ArrowFunctionExpression) {

        const result: CODEOUT = this.generateFunctionParams(node);

        if (node.type === Syntax.ArrowFunctionExpression) {
            result.push(space);
            result.push('=>');
        }

        if (node.expression) {
            result.push(space);
            let expr: CODEOUT = this.generateExpression(node.body, Precedence.Assignment, E_TTT);
            if (expr.toString().charAt(0) === '{') {
                expr = ['(', expr, ')'];
            }
            result.push(expr);
        } else {
            result.push(this.maybeBlock(node.body, S_TTFF));
        }

        return result;
    }

    generateIterationForStatement(operator: 'in' | 'of', stmt: ForInStatement | ForOfStatement, flags: number) {
        let result: CODEOUT[] = ['for' + space + '('];
        // const that = this;
        withIndent(() => {
            const left = stmt.left;
            if (isVariableDeclaration(left)) {
                withIndent(() => {
                    result.push(left.kind + noEmptySpace());
                    result.push(this.generateStatement(left.declarations[0], S_FFFF));
                });
            } else {
                result.push(this.generateExpression(left, Precedence.Call, E_TTT));
            }

            result = join(result, operator);
            result = [join(result, this.generateExpression(stmt.right, Precedence.Sequence, E_TTT)), ')'];
        });
        result.push(this.maybeBlock(stmt.body, flags));
        return result;
    }

    generatePropertyKey(expr: Expression, computed: boolean) {

        if (computed) {
            return ['[', this.generateExpression(expr, Precedence.Sequence, E_TTT), ']'];
        } else {
            return [this.generateExpression(expr, Precedence.Sequence, E_TTT)];
        }
    }

    generateAssignment(left: Identifier | BindingPattern | FunctionParameter | Expression, right: Expression, operator: string, precedence: number, flags: number) {
        if (Precedence.Assignment < precedence) {
            flags |= F_ALLOW_IN;
        }

        return parenthesize(
            [this.generateExpression(left, Precedence.Call, flags), space + operator + space, this.generateExpression(right, Precedence.Assignment, flags)],
            Precedence.Assignment,
            precedence
        );
    }

    semicolon(flags: number) {
        if (!semicolons && flags & F_SEMICOLON_OPT) {
            return '';
        }
        return ';';
    }
}

// Helpers.

function generateIdentifier(node: Identifier) {
    return toSourceNodeWhenNeeded(node.name, node);
}

function generateAsyncPrefix(node: FunctionDeclaration | FunctionExpression | ArrowFunctionExpression, spaceRequired: boolean): string {
    return node.async ? 'async' + (spaceRequired ? noEmptySpace() : space) : '';
}

function generateStarSuffix(node: FunctionExpression | FunctionDeclaration): string {
    const isGenerator = node.generator && !extra.moz.starlessGenerator;
    return isGenerator ? '*' + space : '';
}

function generateMethodPrefix(prop: MethodDefinition): string {
    const func = prop.value;
    if (func.async) {
        return generateAsyncPrefix(func, !prop.computed);
    } else {
        // avoid space before method name
        return generateStarSuffix(func) ? '*' : '';
    }
}

export interface FormatOptions {
    indent?: {
        style: string;
        base: number;
        adjustMultilineComment: boolean;
    };
    newline?: '\n';
    space?: ' ';
    json?: boolean;
    renumber?: boolean;
    hexadecimal?: boolean;
    quotes?: 'single' | 'double';
    escapeless?: boolean;
    compact?: boolean;
    parentheses?: boolean;
    semicolons?: boolean;
    safeConcatenation?: boolean;
    preserveBlankLines?: boolean;
}

export interface MozillaOptions {
    comprehensionExpressionStartsWithAssignment: false;
    starlessGenerator: false;
}

export interface GenerateOptions {
    // TODO: This makes our encapsulation leaky.
    // parse?: (arg: unknown) => Module | Script;
    comment?: boolean;
    file?: string;
    format?: FormatOptions;
    moz?: MozillaOptions;
    sourceContent?: string;
    sourceMap?: null;
    sourceMapRoot?: null;
    sourceMapWithCode?: false;
    directive?: false;
    raw?: true;
    verbatim?: string | null;
    sourceCode?: null;
}

/**
 * Generates the code corresponding to the tree.
 * The return format depends upon whether the sourceMapWithCode option is defined.
 * @param program 
 * @param options 
 * @returns 
 */
export function generate(program: Module | Script, options?: GenerateOptions) {
    // console.lg(`generate(node..., options=${JSON.stringify(options)})`);
    const defaultOptions = getDefaultOptions();

    if (options) {
        options = updateDeeply(defaultOptions as { [key: string]: unknown }, options as { [key: string]: unknown });
        indent = options.format.indent.style;
        base = stringRepeat(indent, options.format.indent.base);
    } else {
        options = defaultOptions;
        indent = options.format.indent.style;
        base = stringRepeat(indent, options.format.indent.base);
    }
    json = options.format.json;
    renumber = options.format.renumber;
    hexadecimal = json ? false : options.format.hexadecimal;
    quotes = json ? 'double' : options.format.quotes;
    escapeless = options.format.escapeless;
    newline = options.format.newline;
    space = options.format.space;
    if (options.format.compact) {
        newline = space = indent = base = '';
    }
    parentheses = options.format.parentheses;
    semicolons = options.format.semicolons;
    safeConcatenation = options.format.safeConcatenation;
    directive = options.directive;
    // parse = json ? null : options.parse;
    sourceMap = options.sourceMap;
    sourceCode = options.sourceCode;
    preserveBlankLines = options.format.preserveBlankLines && sourceCode !== null;
    extra = options;

    const result = generateProgram(program);

    let pair: { code: string; map: { setSourceContent: (sourceMap: string, sourceContent: string) => void } };
    if (!sourceMap) {
        pair = { code: result.toString(), map: null };
        return options.sourceMapWithCode ? pair : pair.code;
    } else {

        pair = (result as SourceNode).toStringWithSourceMap({
            file: options.file,
            sourceRoot: options.sourceMapRoot,
        });

        if (options.sourceContent) {
            pair.map.setSourceContent(options.sourceMap, options.sourceContent);
        }

        if (options.sourceMapWithCode) {
            return pair;
        }

        return pair.map.toString();
    }
}

const FORMAT_MINIFY = {
    indent: {
        style: '',
        base: 0,
    },
    renumber: true,
    hexadecimal: true,
    quotes: 'auto',
    escapeless: true,
    compact: true,
    parentheses: false,
    semicolons: false,
};

const FORMAT_DEFAULTS = getDefaultOptions().format;

export const escodegen = {
    generate: generate,
    Precedence: updateDeeply({}, Precedence),
    FORMAT_MINIFY: FORMAT_MINIFY,
    FORMAT_DEFAULT: FORMAT_DEFAULTS,
};
