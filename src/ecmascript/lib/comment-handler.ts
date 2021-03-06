import { MetaData } from './MetaData';
import { SourceLocation } from './scanner';
import { Syntax } from './syntax';

/**
 * TODO: Should be part of the tree? 
 */
export interface Comment {
    /**
     *
     */
    type: 'Line' | 'Block';
    value: string;
    range?: [number, number];
    loc?: SourceLocation;
    extendedRange?: [number, number];
}

interface Entry {
    comment: Comment;
    start: number;
}

interface NodeInfo {
    node: VisitableNode;
    start: number;
}

interface VisitableNode {
    /**
     * Now optional and can also take number to make consistent with TokenEntry.
     */
    type?: string | number;
    /**
     * Now optional and also takes number to make consistent with TokenEntry.
     */
    value?: string | number;
    range?: [number, number];
    loc?: SourceLocation;
    leadingComments?: Comment[];
    innerComments?: Comment[];
    trailingComments?: Comment[];
    body?: unknown[];
}

export class CommentHandler {
    attach: boolean;
    comments: Comment[];
    stack: NodeInfo[];
    leading: Entry[];
    trailing: Entry[];

    constructor() {
        this.attach = false;
        this.comments = [];
        this.stack = [];
        this.leading = [];
        this.trailing = [];
    }

    insertInnerComments(node: VisitableNode, metadata: MetaData): void {
        //  innnerComments for properties empty block
        //  `function a() {/** comments **\/}`
        if (node.type === Syntax.BlockStatement && node.body.length === 0) {
            const innerComments: Comment[] = [];
            for (let i = this.leading.length - 1; i >= 0; --i) {
                const entry = this.leading[i];
                if (metadata.end.offset >= entry.start) {
                    innerComments.unshift(entry.comment);
                    this.leading.splice(i, 1);
                    this.trailing.splice(i, 1);
                }
            }
            if (innerComments.length) {
                node.innerComments = innerComments;
            }
        }
    }

    findTrailingComments(metadata: MetaData): Comment[] {
        let trailingComments: Comment[] = [];

        if (this.trailing.length > 0) {
            for (let i = this.trailing.length - 1; i >= 0; --i) {
                const entry = this.trailing[i];
                if (entry.start >= metadata.end.offset) {
                    trailingComments.unshift(entry.comment);
                }
            }
            this.trailing.length = 0;
            return trailingComments;
        }

        const entry = this.stack[this.stack.length - 1];
        if (entry && entry.node.trailingComments) {
            const firstComment = entry.node.trailingComments[0];
            if (firstComment && firstComment.range[0] >= metadata.end.offset) {
                trailingComments = entry.node.trailingComments;
                delete entry.node.trailingComments;
            }
        }
        return trailingComments;
    }

    findLeadingComments(metadata: MetaData): Comment[] {
        const leadingComments: Comment[] = [];

        let target: { leadingComments?: Comment[] };
        while (this.stack.length > 0) {
            const entry = this.stack[this.stack.length - 1];
            if (entry && entry.start >= metadata.start.offset) {
                target = entry.node;
                this.stack.pop();
            } else {
                break;
            }
        }

        if (target) {
            const count = target.leadingComments ? target.leadingComments.length : 0;
            for (let i = count - 1; i >= 0; --i) {
                const comment = target.leadingComments[i];
                if (comment.range[1] <= metadata.start.offset) {
                    leadingComments.unshift(comment);
                    target.leadingComments.splice(i, 1);
                }
            }
            if (target.leadingComments && target.leadingComments.length === 0) {
                delete target.leadingComments;
            }
            return leadingComments;
        }

        for (let i = this.leading.length - 1; i >= 0; --i) {
            const entry = this.leading[i];
            if (entry.start <= metadata.start.offset) {
                leadingComments.unshift(entry.comment);
                this.leading.splice(i, 1);
            }
        }
        return leadingComments;
    }

    visitNode(node: VisitableNode, metadata: MetaData): void {
        if (node.type === Syntax.Program && node.body.length > 0) {
            return;
        }

        this.insertInnerComments(node, metadata);
        const trailingComments = this.findTrailingComments(metadata);
        const leadingComments = this.findLeadingComments(metadata);
        if (leadingComments.length > 0) {
            node.leadingComments = leadingComments;
        }
        if (trailingComments.length > 0) {
            node.trailingComments = trailingComments;
        }

        this.stack.push({
            node: node,
            start: metadata.start.offset,
        });
    }

    visitComment(node: VisitableNode, metadata: MetaData): void {
        const type = (node.type as string)[0] === 'L' ? 'Line' : 'Block';
        const comment: Comment = {
            type: type,
            value: node.value as string,
        };
        if (node.range) {
            comment.range = node.range;
        }
        if (node.loc) {
            comment.loc = node.loc;
        }
        this.comments.push(comment);

        if (this.attach) {
            const entry: Entry = {
                comment: {
                    type: type,
                    value: node.value as string,
                    range: [metadata.start.offset, metadata.end.offset],
                },
                start: metadata.start.offset,
            };
            if (node.loc) {
                entry.comment.loc = node.loc;
            }
            node.type = type;
            this.leading.push(entry);
            this.trailing.push(entry);
        }
    }

    visit(node: VisitableNode, metadata: MetaData): void {
        if (node.type === 'LineComment') {
            this.visitComment(node, metadata);
        } else if (node.type === 'BlockComment') {
            this.visitComment(node, metadata);
        } else if (this.attach) {
            this.visitNode(node, metadata);
        }
    }
}
