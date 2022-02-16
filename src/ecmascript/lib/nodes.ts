import { Comment } from './comment-handler';
import { Error } from './error-handler';
import { StatementType, Syntax } from './syntax';
import { TokenEntry } from './token';

export type ArgumentListElement = Expression | SpreadElement;
export type ArrayExpressionElement = Expression | SpreadElement | null;
export type ArrayPatternElement = AssignmentPattern | BindingIdentifier | BindingPattern | RestElement | null;
export type BindingPattern = ArrayPattern | ObjectPattern;
export type BindingIdentifier = Identifier;
export type Declaration = AsyncFunctionDeclaration | ClassDeclaration | ExportDeclaration | FunctionDeclaration | ImportDeclaration | VariableDeclaration;
export type ExportableDefaultDeclaration = BindingIdentifier | BindingPattern | ClassDeclaration | Expression | FunctionDeclaration;
export type ExportableNamedDeclaration = AsyncFunctionDeclaration | ClassDeclaration | FunctionDeclaration | VariableDeclaration;
export type ExportDeclaration = ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration;
export type Expression =
  | ArrayExpression
  | ArrowFunctionExpression
  | AssignmentExpression
  | AsyncArrowFunctionExpression
  | AsyncFunctionExpression
  | AwaitExpression
  | BinaryExpression
  | CallExpression
  | ClassExpression
  | ComputedMemberExpression
  | ConditionalExpression
  | Identifier
  | FunctionExpression
  | Literal
  | NewExpression
  | ObjectExpression
  | RegexLiteral
  | SequenceExpression
  | SpreadElement
  | StaticMemberExpression
  | TaggedTemplateExpression
  | ThisExpression
  | UnaryExpression
  | UpdateExpression
  | YieldExpression;
export type FunctionParameter = AssignmentPattern | BindingIdentifier | BindingPattern;
export type ImportDeclarationSpecifier = ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier;
export type ObjectExpressionProperty = Property | SpreadProperty;
export type ObjectPatternProperty = Property | RestProperty;
export type PatternParam = ArrayPatternElement | Identifier | BindingPattern | Expression | RestProperty | PropertyValue;
export type Statement =
  | AsyncFunctionDeclaration
  | BreakStatement
  | ClassDeclaration
  | ContinueStatement
  | DebuggerStatement
  | DoWhileStatement
  | EmptyStatement
  | ExpressionStatement
  | Directive
  | ForStatement
  | ForInStatement
  | ForOfStatement
  | FunctionDeclaration
  | IfStatement
  | LabeledStatement
  | ReturnStatement
  | SwitchStatement
  | ThrowStatement
  | TryStatement
  | VariableDeclaration
  | WhileStatement
  | WithStatement;

export type ReinterpretedExpressionPattern = BindingPattern | AssignmentPattern | RestElement | RestProperty;

export type PropertyKey = Identifier | Literal | Expression;

export function isIdentifier(key: { type: string }): key is Identifier {
  return key.type === Syntax.Identifier;
}

export function isLiteral(key: PropertyKey): key is Literal {
  return key.type === Syntax.Literal;
}

export type PropertyValue = AssignmentPattern | AsyncFunctionExpression | BindingIdentifier | BindingPattern | FunctionExpression | Expression;
export type StatementListItem = Declaration | Statement;

/* tslint:disable:max-classes-per-file */

export interface Position {
  /** >= 1 */
  line: number;
  /** >= 0 */
  column: number;
}

export interface SourceLocation {
  source?: string | null | undefined;
  start: Position;
  end: Position;
}

export interface BaseNodeWithoutComments {
  // Every leaf interface that extends BaseNode must specify a type property.
  // The type property should be a string literal. For example, Identifier
  // has: `type: "Identifier"`
  type: string;
  loc?: SourceLocation | null | undefined;
  range?: [number, number] | undefined;
}

export interface BaseNode extends BaseNodeWithoutComments {
  leadingComments?: Comment[];
  trailingComments?: Comment[];
}

export class ArrayExpression implements BaseNode {
  type: StatementType;
  readonly elements: ArrayExpressionElement[];
  constructor(elements: ArrayExpressionElement[]) {
    this.type = Syntax.ArrayExpression;
    this.elements = elements;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isArrayExpression(p: { type: StatementType }): p is ArrayExpression {
  return p.type === Syntax.ArrayExpression;
}

export class ArrayPattern implements BaseNode {
  readonly type: StatementType;
  readonly elements: ArrayPatternElement[];
  constructor(elements: ArrayPatternElement[]) {
    this.type = Syntax.ArrayPattern;
    this.elements = elements;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isArrayPattern(p: { type: StatementType }): p is ArrayPattern {
  return p.type === Syntax.ArrayPattern;
}

export class ArrowFunctionExpression implements BaseNode {
  readonly type: StatementType;
  readonly id: Identifier | null;
  readonly params: (FunctionParameter | PatternParam)[];
  readonly body: BlockStatement | Expression;
  readonly generator: boolean;
  readonly expression: boolean;
  readonly async: boolean;
  readonly rest?: Identifier;
  readonly defaults?: Expression[];
  constructor(params: (FunctionParameter | PatternParam)[], body: BlockStatement | Expression, expression: boolean) {
    this.type = Syntax.ArrowFunctionExpression;
    this.id = null;
    this.params = params;
    this.body = body;
    this.generator = false;
    this.expression = expression;
    this.async = false;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isArrowFunctionExpression(p: { type: StatementType }): p is ArrowFunctionExpression {
  return p.type === Syntax.ArrowFunctionExpression;
}

export class AssignmentExpression implements BaseNode {
  type: StatementType;
  operator: string;
  readonly left: Expression;
  readonly right: Expression;
  constructor(operator: string, left: Expression, right: Expression) {
    this.type = Syntax.AssignmentExpression;
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isAssignmentExpression(p: { type: StatementType }): p is AssignmentExpression {
  return p.type === Syntax.AssignmentExpression;
}

export class AssignmentPattern implements BaseNode {
  readonly type: StatementType;
  readonly left: BindingIdentifier | BindingPattern;
  readonly right: Expression;
  constructor(left: BindingIdentifier | BindingPattern, right: Expression) {
    this.type = Syntax.AssignmentPattern;
    this.left = left;
    this.right = right;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isAssignmentPattern(p: { type: StatementType }): p is AssignmentPattern {
  return p.type === Syntax.AssignmentPattern;
}

export class AsyncArrowFunctionExpression implements BaseNode {
  readonly type: StatementType;
  readonly id: Identifier | null;
  readonly params: (FunctionParameter | PatternParam)[];
  readonly body: BlockStatement | Expression;
  readonly generator: boolean;
  readonly expression: boolean;
  readonly async: boolean;
  constructor(params: (FunctionParameter | PatternParam)[], body: BlockStatement | Expression, expression: boolean) {
    this.type = Syntax.ArrowFunctionExpression;
    this.id = null;
    this.params = params;
    this.body = body;
    this.generator = false;
    this.expression = expression;
    this.async = true;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class AsyncFunctionDeclaration implements BaseNode {
  readonly type: StatementType;
  readonly id: Identifier | null;
  readonly params: FunctionParameter[];
  readonly body: BlockStatement;
  readonly generator: boolean;
  readonly expression: boolean;
  readonly async: boolean;
  constructor(id: Identifier | null, params: FunctionParameter[], body: BlockStatement) {
    this.type = Syntax.FunctionDeclaration;
    this.id = id;
    this.params = params;
    this.body = body;
    this.generator = false;
    this.expression = false;
    this.async = true;
  }
  // BaseNode 
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class AsyncFunctionExpression implements BaseNode {
  readonly type: StatementType;
  readonly id: Identifier | null;
  readonly params: FunctionParameter[];
  readonly body: BlockStatement | Expression;
  readonly generator: boolean;
  readonly expression: boolean;
  readonly async: boolean;
  constructor(id: Identifier | null, params: FunctionParameter[], body: BlockStatement | Expression) {
    this.type = Syntax.FunctionExpression;
    this.id = id;
    this.params = params;
    this.body = body;
    this.generator = false;
    this.expression = false;
    this.async = true;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class AwaitExpression implements BaseNode {
  readonly type: StatementType;
  readonly argument: Expression;
  /**
   * Used by escodegen.
   */
  delegate?: unknown;
  constructor(argument: Expression) {
    this.type = Syntax.AwaitExpression;
    this.argument = argument;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

// TODO: Complete
export type BinaryOperator = '+' | '-'

export class BinaryExpression implements BaseNode {
  type: StatementType;
  operator: string;
  readonly left: Expression;
  readonly right: Expression;
  constructor(operator: string, left: Expression, right: Expression) {
    const logical = operator === '||' || operator === '&&' || operator === '??';
    this.type = logical ? Syntax.LogicalExpression : Syntax.BinaryExpression;
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class BlockStatement implements BaseNode {
  readonly type: StatementType;
  readonly body: Statement[] | StatementListItem[];
  constructor(body: Statement[] | StatementListItem[]) {
    this.type = Syntax.BlockStatement;
    this.body = body;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class BreakStatement implements BaseNode {
  readonly type: StatementType;
  readonly label: Identifier | null;
  constructor(label: Identifier | null) {
    this.type = Syntax.BreakStatement;
    this.label = label;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class CallExpression implements BaseNode {
  type: string;
  callee: Expression | Import;
  arguments: ArgumentListElement[];
  optional: boolean;
  constructor(callee: Expression | Import, args: ArgumentListElement[]) {
    this.type = Syntax.CallExpression;
    this.callee = callee;
    this.arguments = args;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class CatchClause implements BaseNode {
  readonly type: StatementType;
  readonly param: BindingIdentifier | BindingPattern;
  readonly body: BlockStatement;
  /**
   * Used by escodegen.
   */
  guard?: Expression;
  constructor(param: BindingIdentifier | BindingPattern, body: BlockStatement) {
    this.type = Syntax.CatchClause;
    this.param = param;
    this.body = body;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ClassBody implements BaseNode {
  readonly type: StatementType;
  readonly body: (Property | MethodDefinition)[];
  constructor(body: (Property | MethodDefinition)[]) {
    this.type = Syntax.ClassBody;
    this.body = body;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ClassDeclaration implements BaseNode {
  readonly type: StatementType;
  readonly id: Identifier | null;
  readonly superClass: Identifier | Expression | null;
  readonly body: ClassBody;
  constructor(id: Identifier | null, superClass: Identifier | Expression | null, body: ClassBody) {
    this.type = Syntax.ClassDeclaration;
    this.id = id;
    this.superClass = superClass;
    this.body = body;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ClassExpression implements BaseNode {
  readonly type: StatementType;
  readonly id: Identifier | null;
  readonly superClass: Identifier | Expression | null;
  readonly body: ClassBody;
  constructor(id: Identifier | null, superClass: Identifier | Expression | null, body: ClassBody) {
    this.type = Syntax.ClassExpression;
    this.id = id;
    this.superClass = superClass;
    this.body = body;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class MemberExpression implements BaseNode {
  readonly type: StatementType;
  readonly computed: boolean;
  readonly object: Expression;
  readonly property: Expression;
  constructor(object: Expression, property: Expression, computed: boolean) {
    this.type = Syntax.MemberExpression;
    this.computed = computed;
    this.object = object;
    this.property = property;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ComputedMemberExpression extends MemberExpression {
  constructor(object: Expression, property: Expression) {
    super(object, property, true);
  }
}

export class ConditionalExpression implements BaseNode {
  readonly type: StatementType;
  readonly test: Expression;
  readonly consequent: Expression;
  readonly alternate: Expression;
  constructor(test: Expression, consequent: Expression, alternate: Expression) {
    this.type = Syntax.ConditionalExpression;
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ContinueStatement implements BaseNode {
  readonly type: StatementType;
  readonly label: Identifier | null;
  constructor(label: Identifier | null) {
    this.type = Syntax.ContinueStatement;
    this.label = label;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class DebuggerStatement implements BaseNode {
  readonly type: StatementType;
  constructor() {
    this.type = Syntax.DebuggerStatement;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class Directive implements BaseNode {
  readonly type: StatementType;
  readonly expression: Expression;
  readonly directive: string;
  /**
   * Used by escodegen.
   */
  raw?: string;
  constructor(expression: Expression, directive: string) {
    this.type = Syntax.ExpressionStatement;
    this.expression = expression;
    this.directive = directive;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class DoWhileStatement implements BaseNode {
  readonly type: StatementType;
  body: Statement;
  readonly test: Expression;
  constructor(body: Statement, test: Expression) {
    this.type = Syntax.DoWhileStatement;
    this.body = body;
    this.test = test;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class EmptyStatement implements BaseNode {
  readonly type: StatementType;
  constructor() {
    this.type = Syntax.EmptyStatement;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ExportAllDeclaration implements BaseNode {
  readonly type: StatementType;
  readonly source: Literal;
  constructor(source: Literal) {
    this.type = Syntax.ExportAllDeclaration;
    this.source = source;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ExportDefaultDeclaration implements BaseNode {
  readonly type: StatementType;
  readonly declaration: ExportableDefaultDeclaration;
  constructor(declaration: ExportableDefaultDeclaration) {
    this.type = Syntax.ExportDefaultDeclaration;
    this.declaration = declaration;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ExportNamedDeclaration implements BaseNode {
  readonly type: StatementType;
  readonly declaration: ExportableNamedDeclaration | StatementListItem | null;
  readonly specifiers: ExportSpecifier[];
  readonly source: Literal | null;
  constructor(declaration: ExportableNamedDeclaration | StatementListItem | null, specifiers: ExportSpecifier[], source: Literal | null) {
    this.type = Syntax.ExportNamedDeclaration;
    this.declaration = declaration;
    this.specifiers = specifiers;
    this.source = source;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ExportSpecifier implements BaseNode {
  readonly type: StatementType;
  readonly exported: Identifier;
  readonly local: Identifier;
  constructor(local: Identifier, exported: Identifier) {
    this.type = Syntax.ExportSpecifier;
    this.exported = exported;
    this.local = local;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ExpressionStatement implements BaseNode {
  readonly type: StatementType;
  readonly expression: Expression;
  constructor(expression: Expression) {
    this.type = Syntax.ExpressionStatement;
    this.expression = expression;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ForInStatement implements BaseNode {
  readonly type: StatementType;
  readonly left: Expression;
  readonly right: Expression;
  readonly body: Statement | Expression;
  readonly each: boolean;
  constructor(left: Expression, right: Expression, body: Statement | Expression) {
    this.type = Syntax.ForInStatement;
    this.left = left;
    this.right = right;
    this.body = body;
    this.each = false;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ForOfStatement implements BaseNode {
  readonly type: StatementType;
  readonly left: Expression;
  readonly right: Expression;
  readonly body: Statement | Expression;
  constructor(left: Expression, right: Expression, body: Statement | Expression) {
    this.type = Syntax.ForOfStatement;
    this.left = left;
    this.right = right;
    this.body = body;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ForStatement implements BaseNode {
  readonly type: StatementType;
  readonly init: Expression | null;
  readonly test: Expression | null;
  readonly update: Expression | null;
  body: Statement | Expression;
  constructor(init: Expression | null, test: Expression | null, update: Expression | null, body: Statement | Expression) {
    this.type = Syntax.ForStatement;
    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class FunctionDeclaration implements BaseNode {
  readonly type: StatementType;
  readonly id: Identifier | null;
  readonly params: FunctionParameter[];
  readonly body: BlockStatement;
  readonly generator: boolean;
  readonly expression: boolean;
  readonly async: boolean;
  readonly rest?: Identifier;
  readonly defaults?: Expression[];
  constructor(id: Identifier | null, params: FunctionParameter[], body: BlockStatement, generator: boolean) {
    this.type = Syntax.FunctionDeclaration;
    this.id = id;
    this.params = params;
    this.body = body;
    this.generator = generator;
    this.expression = false;
    this.async = false;
  }
  // BaseNode
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class FunctionExpression implements BaseNode {
  readonly type: StatementType;
  readonly id: Identifier | null;
  readonly params: FunctionParameter[];
  readonly body: BlockStatement | Expression;
  readonly generator: boolean;
  readonly expression: boolean;
  readonly async: boolean;
  readonly rest?: Identifier;
  readonly defaults?: Expression[];
  constructor(id: Identifier | null, params: FunctionParameter[], body: BlockStatement | Expression, generator: boolean) {
    this.type = Syntax.FunctionExpression;
    this.id = id;
    this.params = params;
    this.body = body;
    this.generator = generator;
    this.expression = false;
    this.async = false;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class Identifier implements BaseNode {
  type: StatementType;
  name: string;
  range: [number, number];
  constructor(name: string | number) {
    this.type = Syntax.Identifier;
    if (typeof name === 'string') {
      this.name = name;
    } else {
      throw new Error(`name must be a string, I think. (${typeof name})`);
    }
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
}

export class IfStatement implements BaseNode {
  readonly type: StatementType;
  readonly test: Expression;
  readonly consequent: Statement;
  readonly alternate: Statement | null;
  constructor(test: Expression, consequent: Statement, alternate: Statement | null) {
    this.type = Syntax.IfStatement;
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class Import implements BaseNode {
  readonly type: StatementType;
  constructor() {
    this.type = Syntax.Import;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ImportDeclaration implements BaseNode {
  readonly type: StatementType;
  readonly specifiers: ImportDeclarationSpecifier[];
  readonly source: Literal;
  constructor(specifiers: ImportDeclarationSpecifier[], source: Literal) {
    this.type = Syntax.ImportDeclaration;
    this.specifiers = specifiers;
    this.source = source;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ImportDefaultSpecifier implements BaseNode {
  readonly type: StatementType;
  readonly local: Identifier;
  constructor(local: Identifier) {
    this.type = Syntax.ImportDefaultSpecifier;
    this.local = local;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ImportNamespaceSpecifier implements BaseNode {
  readonly type: StatementType;
  readonly local: Identifier;
  constructor(local: Identifier) {
    this.type = Syntax.ImportNamespaceSpecifier;
    this.local = local;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ImportSpecifier implements BaseNode {
  readonly type: StatementType;
  readonly local: Identifier;
  readonly imported: Identifier;
  constructor(local: Identifier, imported: Identifier) {
    this.type = Syntax.ImportSpecifier;
    this.local = local;
    this.imported = imported;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class LabeledStatement implements BaseNode {
  readonly type: StatementType;
  readonly label: Identifier;
  readonly body: Statement | ClassDeclaration;
  constructor(label: Identifier, body: Statement | ClassDeclaration) {
    this.type = Syntax.LabeledStatement;
    this.label = label;
    this.body = body;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class Literal implements BaseNode {
  readonly type: StatementType;
  readonly value: boolean | number | string | null;
  readonly raw: string;
  range: [number, number];
  constructor(value: boolean | number | string | null, raw: string) {
    this.type = Syntax.Literal;
    this.value = value;
    this.raw = raw;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
}

export class MetaProperty implements BaseNode {
  readonly type: StatementType;
  readonly meta: Identifier;
  readonly property: Identifier;
  constructor(meta: Identifier, property: Identifier) {
    this.type = Syntax.MetaProperty;
    this.meta = meta;
    this.property = property;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class MethodDefinition implements BaseNode {
  readonly type: StatementType;
  readonly key: Expression | null;
  readonly computed: boolean;
  readonly value: AsyncFunctionExpression | FunctionExpression | null;
  readonly kind: string;
  readonly static: boolean;
  constructor(key: Expression | null, computed: boolean, value: AsyncFunctionExpression | FunctionExpression | null, kind: string, isStatic: boolean) {
    this.type = Syntax.MethodDefinition;
    this.key = key;
    this.computed = computed;
    this.value = value;
    this.kind = kind;
    this.static = isStatic;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class Module implements BaseNode {
  readonly type: StatementType;
  readonly body: StatementListItem[];
  readonly sourceType: string;
  comments?: Comment[];
  tokens?: TokenEntry[];
  errors?: Error[];
  constructor(body: StatementListItem[]) {
    this.type = Syntax.Program;
    this.body = body;
    this.sourceType = 'module';
  }
  leadingComments?: Comment[];
  trailingComments?: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class NewExpression implements BaseNode {
  readonly type: StatementType;
  readonly callee: Expression;
  readonly arguments: ArgumentListElement[];
  constructor(callee: Expression, args: ArgumentListElement[]) {
    this.type = Syntax.NewExpression;
    this.callee = callee;
    this.arguments = args;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ObjectExpression implements BaseNode {
  type: StatementType;
  readonly properties: ObjectExpressionProperty[];
  constructor(properties: ObjectExpressionProperty[]) {
    this.type = Syntax.ObjectExpression;
    this.properties = properties;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isObjectExpression(p: { type: StatementType }): p is ObjectExpression {
  return p.type === Syntax.ObjectExpression;
}

export class ObjectPattern implements BaseNode {
  readonly type: StatementType;
  readonly properties: ObjectPatternProperty[];
  constructor(properties: ObjectPatternProperty[]) {
    this.type = Syntax.ObjectPattern;
    this.properties = properties;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isObjectPattern(p: { type: StatementType }): p is ObjectPattern {
  return p.type === Syntax.ObjectPattern;
}

export class Property implements BaseNode {
  readonly type: StatementType;
  readonly key: PropertyKey;
  readonly computed: boolean;
  readonly value: PropertyValue | null;
  readonly kind: string;
  readonly method: boolean;
  readonly shorthand: boolean;
  constructor(kind: 'get' | 'set' | 'init', key: PropertyKey, computed: boolean, value: PropertyValue | null, method: boolean, shorthand: boolean) {
    this.type = Syntax.Property;
    this.key = key;
    this.computed = computed;
    this.value = value;
    this.kind = kind;
    this.method = method;
    this.shorthand = shorthand;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isProperty(p: { type: StatementType }): p is Property {
  return p.type === Syntax.Property;
}

export class RegexLiteral implements BaseNode {
  readonly type: StatementType;
  readonly value: RegExp;
  readonly raw: string;
  readonly regex: { pattern: string; flags: string };
  constructor(value: RegExp, raw: string, pattern: string, flags: string) {
    this.type = Syntax.Literal;
    this.value = value;
    this.raw = raw;
    this.regex = { pattern, flags };
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class RestElement implements BaseNode {
  type: StatementType;
  argument: BindingIdentifier | BindingPattern | ReinterpretedExpressionPattern;
  constructor(argument: BindingIdentifier | BindingPattern | ReinterpretedExpressionPattern) {
    this.type = Syntax.RestElement;
    this.argument = argument;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isRestElement(p: { type: StatementType }): p is RestElement {
  return p.type === Syntax.RestElement;
}

export class RestProperty implements BaseNode {
  type: StatementType;
  argument: Expression;
  constructor(argument: Expression) {
    this.type = Syntax.RestProperty;
    this.argument = argument;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isRestProperty(p: { type: StatementType }): p is RestProperty {
  return p.type === Syntax.RestProperty;
}

export class ReturnStatement implements BaseNode {
  readonly type: StatementType;
  readonly argument: Expression | null;
  constructor(argument: Expression | null) {
    this.type = Syntax.ReturnStatement;
    this.argument = argument;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class Script implements BaseNode {
  readonly type: StatementType;
  readonly body: StatementListItem[];
  readonly sourceType: string;
  comments?: Comment[];
  tokens?: TokenEntry[];
  errors?: Error[];
  constructor(body: StatementListItem[]) {
    this.type = Syntax.Program;
    this.body = body;
    this.sourceType = 'script';
  }
  leadingComments?: Comment[];
  trailingComments?: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isProgram(p: { type: StatementType }): p is Module | Script {
  return p.type === Syntax.Program;
}

export class SequenceExpression implements BaseNode {
  readonly type: StatementType;
  readonly expressions: Expression[];
  constructor(expressions: Expression[]) {
    this.type = Syntax.SequenceExpression;
    this.expressions = expressions;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isSequenceExpression(p: { type: StatementType }): p is SequenceExpression {
  return p.type === Syntax.SequenceExpression;
}

export class SpreadElement implements BaseNode {
  type: StatementType;
  readonly argument: Expression;
  constructor(argument: Expression) {
    this.type = Syntax.SpreadElement;
    this.argument = argument;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isSpreadElement(p: { type: StatementType }): p is SpreadElement {
  return p.type === Syntax.SpreadElement;
}

export class SpreadProperty implements BaseNode {
  readonly type: StatementType;
  readonly argument: Expression;
  constructor(argument: Expression) {
    this.type = Syntax.SpreadProperty;
    this.argument = argument;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isSpreadProperty(p: { type: StatementType }): p is SpreadProperty {
  return p.type === Syntax.SpreadProperty;
}

export class StaticMemberExpression implements BaseNode {
  readonly type: StatementType;
  readonly computed: boolean;
  readonly object: Expression;
  readonly property: Expression;
  constructor(object: Expression, property: Expression) {
    this.type = Syntax.MemberExpression;
    this.computed = false;
    this.object = object;
    this.property = property;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class Super implements BaseNode {
  readonly type: StatementType;
  constructor() {
    this.type = Syntax.Super;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class SwitchCase implements BaseNode {
  readonly type: StatementType;
  readonly test: Expression;
  readonly consequent: Statement[] | StatementListItem[];
  constructor(test: Expression, consequent: Statement[] | StatementListItem[]) {
    this.type = Syntax.SwitchCase;
    this.test = test;
    this.consequent = consequent;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class SwitchStatement implements BaseNode {
  readonly type: StatementType;
  readonly discriminant: Expression;
  readonly cases: SwitchCase[];
  constructor(discriminant: Expression, cases: SwitchCase[]) {
    this.type = Syntax.SwitchStatement;
    this.discriminant = discriminant;
    this.cases = cases;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class TaggedTemplateExpression implements BaseNode {
  readonly type: StatementType;
  readonly tag: Expression;
  readonly quasi: TemplateLiteral;
  constructor(tag: Expression, quasi: TemplateLiteral) {
    this.type = Syntax.TaggedTemplateExpression;
    this.tag = tag;
    this.quasi = quasi;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export interface TemplateElementValue {
  cooked: string;
  raw: string;
}

export class TemplateElement implements BaseNode {
  readonly type: StatementType;
  readonly value: TemplateElementValue;
  readonly tail: boolean;
  constructor(value: TemplateElementValue, tail: boolean) {
    this.type = Syntax.TemplateElement;
    this.value = value;
    this.tail = tail;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class TemplateLiteral implements BaseNode {
  readonly type: StatementType;
  readonly quasis: TemplateElement[];
  readonly expressions: Expression[];
  constructor(quasis: TemplateElement[], expressions: Expression[]) {
    this.type = Syntax.TemplateLiteral;
    this.quasis = quasis;
    this.expressions = expressions;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ThisExpression implements BaseNode {
  readonly type: StatementType;
  constructor() {
    this.type = Syntax.ThisExpression;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class ThrowStatement implements BaseNode {
  readonly type: StatementType;
  readonly argument: Expression;
  constructor(argument: Expression) {
    this.type = Syntax.ThrowStatement;
    this.argument = argument;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class TryStatement implements BaseNode {
  readonly type: StatementType;
  readonly block: BlockStatement;
  readonly handler: CatchClause | null;
  readonly finalizer: BlockStatement | null;
  /**
   * Used by escodegen.
   */
  handlers: CatchClause[];
  /**
   * Used by escodegen.
   */
  guardedHandlers: CatchClause[];
  constructor(block: BlockStatement, handler: CatchClause | null, finalizer: BlockStatement | null) {
    this.type = Syntax.TryStatement;
    this.block = block;
    this.handler = handler;
    this.finalizer = finalizer;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class UnaryExpression implements BaseNode {
  readonly type: StatementType;
  operator: string;
  readonly argument: Expression;
  readonly prefix: boolean;
  constructor(operator: string, argument: Expression) {
    this.type = Syntax.UnaryExpression;
    this.operator = operator;
    this.argument = argument;
    this.prefix = true;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export type UpdateOperator = "++" | "--"

export class UpdateExpression implements BaseNode {
  readonly type: StatementType;
  operator: string;
  readonly argument: Expression;
  readonly prefix: boolean;
  constructor(operator: string, argument: Expression, prefix: boolean) {
    this.type = Syntax.UpdateExpression;
    this.operator = operator;
    this.argument = argument;
    this.prefix = prefix;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class VariableDeclaration implements BaseNode {
  readonly type: StatementType;
  readonly declarations: VariableDeclarator[];
  readonly kind: string;
  constructor(declarations: VariableDeclarator[], kind: string) {
    this.type = Syntax.VariableDeclaration;
    this.declarations = declarations;
    this.kind = kind;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isVariableDeclaration(p: { type: StatementType }): p is VariableDeclaration {
  return p.type === Syntax.VariableDeclaration;
}

export class VariableDeclarator implements BaseNode {
  readonly type: StatementType;
  readonly id: BindingIdentifier | BindingPattern;
  readonly init: Expression | null;
  constructor(id: BindingIdentifier | BindingPattern, init: Expression | null) {
    this.type = Syntax.VariableDeclarator;
    this.id = id;
    this.init = init;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class WhileStatement implements BaseNode {
  readonly type: StatementType;
  readonly test: Expression;
  body: Statement;
  constructor(test: Expression, body: Statement) {
    this.type = Syntax.WhileStatement;
    this.test = test;
    this.body = body;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class WithStatement implements BaseNode {
  readonly type: StatementType;
  readonly object: Expression;
  readonly body: Statement;
  constructor(object: Expression, body: Statement) {
    this.type = Syntax.WithStatement;
    this.object = object;
    this.body = body;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export class YieldExpression implements BaseNode {
  type: StatementType;
  argument: Expression | null;
  delegate: boolean;
  constructor(argument: Expression | null, delegate: boolean) {
    this.type = Syntax.YieldExpression;
    this.argument = argument;
    this.delegate = delegate;
  }
  leadingComments: Comment[];
  trailingComments: Comment[];
  loc?: SourceLocation;
  range?: [number, number];
}

export function isYieldExpression(p: { type: StatementType }): p is YieldExpression {
  return p.type === Syntax.YieldExpression;
}
