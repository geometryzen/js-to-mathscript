import { parse, ParseOptions } from './esprima';
import { Module, Script, VariableDeclaration } from './nodes';

const NEWLINE = '\n';

describe('parse', function () {
    it('const x = 1', function () {
        const code = 'const x = 1';
        const tree: Module | Script = parse(code);
        expect(tree.sourceType).toBe('script');
        if (tree instanceof Script) {
            const script = tree;
            expect(script.type).toBe('Program');
            const body = script.body;
            expect(body.length).toBe(1);
            const item = body[0];
            expect(item.type).toBe('VariableDeclaration');
            if (item instanceof VariableDeclaration) {
                expect(item.kind).toBe('const');
            }
        }
        // console.log(`${JSON.stringify(tree, null, 2)}`);
    });
    it('export const number', function () {
        const code = 'export const foo = 1';
        const options: ParseOptions = { sourceType: 'module' };
        const tree: Module | Script = parse(code, options);

        const gold = {
            type: 'Program',
            body: [
                {
                    type: 'ExportNamedDeclaration',
                    declaration: {
                        type: 'VariableDeclaration',
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: 'foo',
                                },
                                init: {
                                    type: 'Literal',
                                    value: 1,
                                    raw: '1',
                                },
                            },
                        ],
                        kind: 'const',
                    },
                    specifiers: [],
                    source: null,
                },
            ],
            sourceType: 'module',
        };
        expect(tree).toEqual(gold);
    });
    it('export const number comment', function () {
        const code = 'export const foo = 1 // Hello World';
        const options: ParseOptions = {
            sourceType: 'module',
            comment: true,
        };
        const tree: Module | Script = parse(code, options);

        const gold = {
            type: 'Program',
            body: [
                {
                    type: 'ExportNamedDeclaration',
                    declaration: {
                        type: 'VariableDeclaration',
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: 'foo',
                                },
                                init: {
                                    type: 'Literal',
                                    value: 1,
                                    raw: '1',
                                },
                            },
                        ],
                        kind: 'const',
                    },
                    specifiers: [],
                    source: null,
                },
            ],
            sourceType: 'module',
            comments: [
                {
                    type: 'Line',
                    value: ' Hello World',
                },
            ],
        };
        expect(tree).toEqual(gold);
    });
    it('export const number comment', function () {
        const code = ['export const foo = 1 // Hello', 'export const bar = 2 // World'].join(NEWLINE);
        const options: ParseOptions = {
            sourceType: 'module',
            comment: true,
        };
        const tree: Module | Script = parse(code, options);

        const gold = {
            type: 'Program',
            body: [
                {
                    type: 'ExportNamedDeclaration',
                    declaration: {
                        type: 'VariableDeclaration',
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: 'foo',
                                },
                                init: {
                                    type: 'Literal',
                                    value: 1,
                                    raw: '1',
                                },
                            },
                        ],
                        kind: 'const',
                    },
                    specifiers: [],
                    source: null,
                },
                {
                    type: 'ExportNamedDeclaration',
                    declaration: {
                        type: 'VariableDeclaration',
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: 'bar',
                                },
                                init: {
                                    type: 'Literal',
                                    value: 2,
                                    raw: '2',
                                },
                            },
                        ],
                        kind: 'const',
                    },
                    specifiers: [],
                    source: null,
                },
            ],
            sourceType: 'module',
            comments: [
                {
                    type: 'Line',
                    value: ' Hello',
                },
                {
                    type: 'Line',
                    value: ' World',
                },
            ],
        };

        expect(tree).toEqual(gold);
    });
    it('export const number comment multiline', function () {
        const code = ['export const foo = 1 // Hello', 'export const bar = 2 // World'].join(NEWLINE);
        const options: ParseOptions = {
            sourceType: 'module',
            comment: true,
            loc: true,
            range: true,
        };
        const tree: Module | Script = parse(code, options);

        const gold = {
            type: 'Program',
            body: [
                {
                    type: 'ExportNamedDeclaration',
                    declaration: {
                        type: 'VariableDeclaration',
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: 'foo',
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
                                },
                                init: {
                                    type: 'Literal',
                                    value: 1,
                                    raw: '1',
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
                                },
                                range: [13, 20],
                                loc: {
                                    start: {
                                        line: 1,
                                        column: 13,
                                    },
                                    end: {
                                        line: 1,
                                        column: 20,
                                    },
                                },
                            },
                        ],
                        kind: 'const',
                        range: [7, 20],
                        loc: {
                            start: {
                                line: 1,
                                column: 7,
                            },
                            end: {
                                line: 1,
                                column: 20,
                            },
                        },
                    },
                    specifiers: [],
                    source: null,
                    range: [0, 20],
                    loc: {
                        start: {
                            line: 1,
                            column: 0,
                        },
                        end: {
                            line: 1,
                            column: 20,
                        },
                    },
                },
                {
                    type: 'ExportNamedDeclaration',
                    declaration: {
                        type: 'VariableDeclaration',
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: 'bar',
                                    range: [43, 46],
                                    loc: {
                                        start: {
                                            line: 2,
                                            column: 13,
                                        },
                                        end: {
                                            line: 2,
                                            column: 16,
                                        },
                                    },
                                },
                                init: {
                                    type: 'Literal',
                                    value: 2,
                                    raw: '2',
                                    range: [49, 50],
                                    loc: {
                                        start: {
                                            line: 2,
                                            column: 19,
                                        },
                                        end: {
                                            line: 2,
                                            column: 20,
                                        },
                                    },
                                },
                                range: [43, 50],
                                loc: {
                                    start: {
                                        line: 2,
                                        column: 13,
                                    },
                                    end: {
                                        line: 2,
                                        column: 20,
                                    },
                                },
                            },
                        ],
                        kind: 'const',
                        range: [37, 59],
                        loc: {
                            start: {
                                line: 2,
                                column: 7,
                            },
                            end: {
                                line: 2,
                                column: 29,
                            },
                        },
                    },
                    specifiers: [],
                    source: null,
                    range: [30, 59],
                    loc: {
                        start: {
                            line: 2,
                            column: 0,
                        },
                        end: {
                            line: 2,
                            column: 29,
                        },
                    },
                },
            ],
            sourceType: 'module',
            range: [0, 59],
            loc: {
                start: {
                    line: 1,
                    column: 0,
                },
                end: {
                    line: 2,
                    column: 29,
                },
            },
            comments: [
                {
                    type: 'Line',
                    value: ' Hello',
                    range: [21, 29],
                    loc: {
                        start: {
                            line: 1,
                            column: 21,
                        },
                        end: {
                            line: 1,
                            column: 29,
                        },
                    },
                },
                {
                    type: 'Line',
                    value: ' World',
                    range: [51, 59],
                    loc: {
                        start: {
                            line: 2,
                            column: 21,
                        },
                        end: {
                            line: 2,
                            column: 29,
                        },
                    },
                },
            ],
        };
        expect(tree).toEqual(gold);
    });
});
