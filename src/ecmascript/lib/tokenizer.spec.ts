import { TokenEntry } from './token';
import { Config, Tokenizer } from './tokenizer';

describe('tokenizer', function () {
    describe('declaration', function () {
        describe('const', function () {
            it('migrated_0000', function () {
                const code = 'const x = 42';
                const config: Config = {};
                const tokenizer = new Tokenizer(code, config);
                expect(tokenizer).toBeDefined();

                let token: TokenEntry;

                token = tokenizer.getNextToken();
                expect(token.type).toBe('Keyword');
                expect(token.value).toBe('const');

                token = tokenizer.getNextToken();
                expect(token.type).toBe('Identifier');
                expect(token.value).toBe('x');

                token = tokenizer.getNextToken();
                expect(token.type).toBe('Punctuator');
                expect(token.value).toBe('=');

                token = tokenizer.getNextToken();
                expect(token.type).toBe('Numeric');
                expect(token.value).toBe('42');

                token = tokenizer.getNextToken();
                expect(token).toBeUndefined();
            });
        });
    });
    describe('ES6', function () {
        describe('export-declaration', function () {
            it('export-const-number', function () {
                const code = 'export const foo = 1';
                const config: Config = {};
                const tokenizer = new Tokenizer(code, config);
                expect(tokenizer).toBeDefined();

                let token: TokenEntry;

                token = tokenizer.getNextToken();
                expect(token.type).toBe('Keyword');
                expect(token.value).toBe('export');

                token = tokenizer.getNextToken();
                expect(token.type).toBe('Keyword');
                expect(token.value).toBe('const');

                token = tokenizer.getNextToken();
                expect(token.type).toBe('Identifier');
                expect(token.value).toBe('foo');

                token = tokenizer.getNextToken();
                expect(token.type).toBe('Punctuator');
                expect(token.value).toBe('=');

                token = tokenizer.getNextToken();
                expect(token.type).toBe('Numeric');
                expect(token.value).toBe('1');

                token = tokenizer.getNextToken();
                expect(token).toBeUndefined();
            });
            it('export-const-number-comment', function () {
                const code = 'export const foo = 1 // Hello, World';
                const config: Config = {
                    comment: true,
                    loc: true,
                    range: true,
                    tolerant: true,
                };
                const tokenizer = new Tokenizer(code, config);
                expect(tokenizer).toBeDefined();

                let token: TokenEntry;

                token = tokenizer.getNextToken();
                expect(token).toEqual({
                    type: 'Keyword',
                    value: 'export',
                    range: [0, 6],
                    loc: {
                        start: {
                            line: 1,
                            column: 0,
                        },
                        end: {
                            line: 1,
                            column: 6,
                        },
                    },
                });

                token = tokenizer.getNextToken();
                expect(token).toEqual({
                    type: 'Keyword',
                    value: 'const',
                    range: [7, 12],
                    loc: {
                        start: {
                            line: 1,
                            column: 7,
                        },
                        end: {
                            line: 1,
                            column: 12,
                        },
                    },
                });

                token = tokenizer.getNextToken();
                expect(token).toEqual({
                    type: 'Identifier',
                    value: 'foo',
                    range: [13, 16],
                    loc: {
                        start: {
                            line: 1,
                            column: 13,
                        },
                        end: {
                            line: 1,
                            column: 16,
                        },
                    },
                });

                token = tokenizer.getNextToken();
                expect(token).toEqual({
                    type: 'Punctuator',
                    value: '=',
                    range: [17, 18],
                    loc: {
                        start: {
                            line: 1,
                            column: 17,
                        },
                        end: {
                            line: 1,
                            column: 18,
                        },
                    },
                });

                token = tokenizer.getNextToken();
                expect(token).toEqual({
                    type: 'Numeric',
                    value: '1',
                    range: [19, 20],
                    loc: {
                        start: {
                            line: 1,
                            column: 19,
                        },
                        end: {
                            line: 1,
                            column: 20,
                        },
                    },
                });

                token = tokenizer.getNextToken();
                expect(token).toEqual({
                    type: 'LineComment',
                    value: ' Hello, World',
                    range: [21, 36],
                    loc: {
                        start: {
                            line: 1,
                            column: 21,
                        },
                        end: {
                            line: 1,
                            column: 36,
                        },
                    },
                });

                token = tokenizer.getNextToken();
                expect(token).toBeUndefined();
            });
        });
    });
});
