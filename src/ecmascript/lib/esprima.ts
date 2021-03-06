/*
  Copyright JS Foundation and other contributors, https://js.foundation/

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

import { CommentHandler } from './comment-handler';
import { JSXParser } from './jsx-parser';
import { MetaData } from './MetaData';
import { Module, Script } from './nodes';
import { CanBeParser, Parser } from './parser';
import { TokenEntry } from './token';
import { Config, Tokenizer } from './tokenizer';
import { Error } from './error-handler';

export interface ParseOptions {
    comment?: boolean;
    attachComment?: boolean;
    sourceType?: 'module' | 'script';
    jsx?: boolean;
    /**
     * Determines whether the parser reports range: [start: number, end: number].
     */
    range?: boolean;
    /**
     * Determines whether the parser reports loc: {start:{line:number;column:number}; end:{line:number;column:number}}
     */
    loc?: boolean;
    tokens?: boolean;
    tolerant?: boolean;
    source?: string;
}

export interface ParseDelegate {
    (node: TokenEntry, metadata?: MetaData): TokenEntry;
}

export function parse(code: string, options?: ParseOptions, delegate?: ParseDelegate): Module | Script {
    let commentHandler: CommentHandler | null = null;
    const proxyDelegate: ParseDelegate = (node: TokenEntry, metadata: MetaData) => {
        const token: TokenEntry = delegate ? delegate(node, metadata) : node;
        if (commentHandler) {
            commentHandler.visit(node, metadata);
        }
        return token;
    };

    let parserDelegate = typeof delegate === 'function' ? proxyDelegate : null;
    let collectComment = false;
    if (options) {
        collectComment = typeof options.comment === 'boolean' && options.comment;
        const attachComment = typeof options.attachComment === 'boolean' && options.attachComment;
        if (collectComment || attachComment) {
            commentHandler = new CommentHandler();
            commentHandler.attach = attachComment;
            options.comment = true;
            parserDelegate = proxyDelegate;
        }
    }

    let isModule = false;
    if (options && typeof options.sourceType === 'string') {
        isModule = options.sourceType === 'module';
    }

    let parser: CanBeParser;
    if (options && typeof options.jsx === 'boolean' && options.jsx) {
        parser = new JSXParser(code, options, parserDelegate);
    } else {
        parser = new Parser(code, options, parserDelegate);
    }

    const program = isModule ? parser.parseModule() : parser.parseScript();
    // const ast = program as any;

    if (collectComment && commentHandler) {
        program.comments = commentHandler.comments;
    }
    if (parser.config.tokens) {
        program.tokens = parser.tokens;
    }
    if (parser.config.tolerant) {
        program.errors = parser.errorHandler.errors;
    }

    return program;
}

export function parseModule(code: string, options: ParseOptions = {}, delegate?: ParseDelegate): Module {
    options.sourceType = 'module';
    return parse(code, options, delegate);
}

export function parseScript(code: string, options: ParseOptions = {}, delegate: ParseDelegate): Script {
    options.sourceType = 'script';
    return parse(code, options, delegate);
}

export function tokenize(code: string, options: Config, delegate?: ParseDelegate): TokenEntry[] {
    const tokenizer = new Tokenizer(code, options);

    const tokens: TokenEntry[] = [];

    try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            let token = tokenizer.getNextToken();
            if (!token) {
                break;
            }
            if (delegate) {
                token = delegate(token);
            }
            tokens.push(token);
        }
    } catch (e) {
        if (e instanceof Error) {
            tokenizer.errorHandler.tolerate(e);
        }
    }

    if (tokenizer.errorHandler.tolerant) {
        // WARNING: Danger Will Robinson!
        // Using a hidden property.
        // TODO: Where is this used? 
        (tokens as unknown as { [key: string]: Error[] })["errors"] = tokenizer.errors();
    }

    return tokens;
}

export { Syntax } from './syntax';

// Sync with *.json manifests.
export const version = '1.1.2';
