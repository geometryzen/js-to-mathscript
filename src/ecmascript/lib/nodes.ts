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
  | ReturnStatement
  | SwitchStatement
  | ThrowStatement
  | TryStatement
  | VariableDeclaration
  | WhileStatement
  | WithStatement;

export type ReinterpretedExpressionPattern = BindingPattern | AssignmentPattern | RestElement | RestProperty;

export type PropertyKey = Identifier | Literal | Expression;

export function isIdentifier(key: PropertyKey): key is Identifier {
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
  leadingComments: Comment[];
  trailingComments: Comment[];
}

export class ArrayExpression {
  type: StatementType;
  readonly elements: ArrayExpressionElement[];
  constructor(elements: ArrayExpressionElement[]) {
    this.type = Syntax.ArrayExpression;
    this.elements = elements;
  }
}

export function isArrayExpression(p: { type: StatementType }): p is ArrayExpression {
  return p.type === Syntax.ArrayExpression;
}

export class ArrayPattern {
  readonly type: StatementType;
  readonly elements: ArrayPatternElement[];
  constructor(elements: ArrayPatternElement[]) {
    this.type = Syntax.ArrayPattern;
    this.elements = elements;
  }
}

export function isArrayPattern(p: { type: StatementType }): p is ArrayPattern {
  return p.type === Syntax.ArrayPattern;
}

export class ArrowFunctionExpression {
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
    this.async = false;
  }
}

export class AssignmentExpression {
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
}

export function isAssignmentExpression(p: { type: StatementType }): p is AssignmentExpression {
  return p.type === Syntax.AssignmentExpression;
}

export class AssignmentPattern {
  readonly type: StatementType;
  readonly left: BindingIdentifier | BindingPattern;
  readonly right: Expression;
  constructor(left: BindingIdentifier | BindingPattern, right: Expression) {
    this.type = Syntax.AssignmentPattern;
    this.left = left;
    this.right = right;
  }
}

export function isAssignmentPattern(p: { type: StatementType }): p is AssignmentPattern {
  return p.type === Syntax.AssignmentPattern;
}

export class AsyncArrowFunctionExpression {
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

export class AsyncFunctionExpression {
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
}

export class AwaitExpression {
  readonly type: StatementType;
  readonly argument: Expression;
  constructor(argument: Expression) {
    this.type = Syntax.AwaitExpression;
    this.argument = argument;
  }
}

// TODO: Complete
export type BinaryOperator = '+' | '-'

export class BinaryExpression {
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
}

export class BlockStatement {
  readonly type: StatementType;
  readonly body: Statement[];
  constructor(body: Statement[]) {
    this.type = Syntax.BlockStatement;
    this.body = body;
  }
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

export class CallExpression {
  type: string;
  callee: Expression | Import;
  arguments: ArgumentListElement[];
  optional: boolean;
  constructor(callee: Expression | Import, args: ArgumentListElement[]) {
    this.type = Syntax.CallExpression;
    this.callee = callee;
    this.arguments = args;
  }
}

export class CatchClause {
  readonly type: StatementType;
  readonly param: BindingIdentifier | BindingPattern;
  readonly body: BlockStatement;
  constructor(param: BindingIdentifier | BindingPattern, body: BlockStatement) {
    this.type = Syntax.CatchClause;
    this.param = param;
    this.body = body;
  }
}

export class ClassBody {
  readonly type: StatementType;
  readonly body: (Property | MethodDefinition)[];
  constructor(body: (Property | MethodDefinition)[]) {
    this.type = Syntax.ClassBody;
    this.body = body;
  }
}

export class ClassDeclaration {
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
}

export class ClassExpression {
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
}

export class ComputedMemberExpression {
  readonly type: StatementType;
  readonly computed: boolean;
  readonly object: Expression;
  readonly property: Expression;
  constructor(object: Expression, property: Expression) {
    this.type = Syntax.MemberExpression;
    this.computed = true;
    this.object = object;
    this.property = property;
  }
}

export class ConditionalExpression {
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

export class Directive {
  readonly type: StatementType;
  readonly expression: Expression;
  readonly directive: string;
  constructor(expression: Expression, directive: string) {
    this.type = Syntax.ExpressionStatement;
    this.expression = expression;
    this.directive = directive;
  }
}

export class DoWhileStatement {
  readonly type: StatementType;
  body: Statement;
  readonly test: Expression;
  constructor(body: Statement, test: Expression) {
    this.type = Syntax.DoWhileStatement;
    this.body = body;
    this.test = test;
  }
}

export class EmptyStatement {
  readonly type: StatementType;
  constructor() {
    this.type = Syntax.EmptyStatement;
  }
}

export class ExportAllDeclaration {
  readonly type: StatementType;
  readonly source: Literal;
  constructor(source: Literal) {
    this.type = Syntax.ExportAllDeclaration;
    this.source = source;
  }
}

export class ExportDefaultDeclaration {
  readonly type: StatementType;
  readonly declaration: ExportableDefaultDeclaration;
  constructor(declaration: ExportableDefaultDeclaration) {
    this.type = Syntax.ExportDefaultDeclaration;
    this.declaration = declaration;
  }
}

export class ExportNamedDeclaration {
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
}

export class ExportSpecifier {
  readonly type: StatementType;
  readonly exported: Identifier;
  readonly local: Identifier;
  constructor(local: Identifier, exported: Identifier) {
    this.type = Syntax.ExportSpecifier;
    this.exported = exported;
    this.local = local;
  }
}

export class ExpressionStatement {
  readonly type: StatementType;
  readonly expression: Expression;
  constructor(expression: Expression) {
    this.type = Syntax.ExpressionStatement;
    this.expression = expression;
  }
}

export class ForInStatement {
  readonly type: StatementType;
  readonly left: Expression;
  readonly right: Expression;
  readonly body: Statement;
  readonly each: boolean;
  constructor(left: Expression, right: Expression, body: Statement) {
    this.type = Syntax.ForInStatement;
    this.left = left;
    this.right = right;
    this.body = body;
    this.each = false;
  }
}

export class ForOfStatement {
  readonly type: StatementType;
  readonly left: Expression;
  readonly right: Expression;
  readonly body: Statement;
  constructor(left: Expression, right: Expression, body: Statement) {
    this.type = Syntax.ForOfStatement;
    this.left = left;
    this.right = right;
    this.body = body;
  }
}

export class ForStatement {
  readonly type: StatementType;
  readonly init: Expression | null;
  readonly test: Expression | null;
  readonly update: Expression | null;
  body: Statement;
  constructor(init: Expression | null, test: Expression | null, update: Expression | null, body: Statement) {
    this.type = Syntax.ForStatement;
    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
  }
}

export class FunctionDeclaration implements BaseNode {
  readonly type: StatementType;
  readonly id: Identifier | null;
  readonly params: FunctionParameter[];
  readonly body: BlockStatement;
  readonly generator: boolean;
  readonly expression: boolean;
  readonly async: boolean;
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

export class FunctionExpression implements BaseNodeWithoutComments {
  readonly type: StatementType;
  readonly id: Identifier | null;
  readonly params: FunctionParameter[];
  readonly body: BlockStatement | Expression;
  readonly generator: boolean;
  readonly expression: boolean;
  readonly async: boolean;
  constructor(id: Identifier | null, params: FunctionParameter[], body: BlockStatement | Expression, generator: boolean) {
    this.type = Syntax.FunctionExpression;
    this.id = id;
    this.params = params;
    this.body = body;
    this.generator = generator;
    this.expression = false;
    this.async = false;
  }
}

export class Identifier {
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
}

export class IfStatement {
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
}

export class Import {
  readonly type: StatementType;
  constructor() {
    this.type = Syntax.Import;
  }
}

export class ImportDeclaration {
  readonly type: StatementType;
  readonly specifiers: ImportDeclarationSpecifier[];
  readonly source: Literal;
  constructor(specifiers: ImportDeclarationSpecifier[], source: Literal) {
    this.type = Syntax.ImportDeclaration;
    this.specifiers = specifiers;
    this.source = source;
  }
}

export class ImportDefaultSpecifier {
  readonly type: StatementType;
  readonly local: Identifier;
  constructor(local: Identifier) {
    this.type = Syntax.ImportDefaultSpecifier;
    this.local = local;
  }
}

export class ImportNamespaceSpecifier {
  readonly type: StatementType;
  readonly local: Identifier;
  constructor(local: Identifier) {
    this.type = Syntax.ImportNamespaceSpecifier;
    this.local = local;
  }
}

export class ImportSpecifier {
  readonly type: StatementType;
  readonly local: Identifier;
  readonly imported: Identifier;
  constructor(local: Identifier, imported: Identifier) {
    this.type = Syntax.ImportSpecifier;
    this.local = local;
    this.imported = imported;
  }
}

export class LabeledStatement {
  readonly type: StatementType;
  readonly label: Identifier;
  readonly body: Statement;
  constructor(label: Identifier, body: Statement) {
    this.type = Syntax.LabeledStatement;
    this.label = label;
    this.body = body;
  }
}

export class Literal {
  readonly type: StatementType;
  readonly value: boolean | number | string | null;
  readonly raw: string;
  range: [number, number];
  constructor(value: boolean | number | string | null, raw: string) {
    this.type = Syntax.Literal;
    this.value = value;
    this.raw = raw;
  }
}

export class MetaProperty {
  readonly type: StatementType;
  readonly meta: Identifier;
  readonly property: Identifier;
  constructor(meta: Identifier, property: Identifier) {
    this.type = Syntax.MetaProperty;
    this.meta = meta;
    this.property = property;
  }
}

export class MethodDefinition {
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
}

export class Module {
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
}

export class NewExpression {
  readonly type: StatementType;
  readonly callee: Expression;
  readonly arguments: ArgumentListElement[];
  constructor(callee: Expression, args: ArgumentListElement[]) {
    this.type = Syntax.NewExpression;
    this.callee = callee;
    this.arguments = args;
  }
}

export class ObjectExpression {
  type: StatementType;
  readonly properties: ObjectExpressionProperty[];
  constructor(properties: ObjectExpressionProperty[]) {
    this.type = Syntax.ObjectExpression;
    this.properties = properties;
  }
}

export function isObjectExpression(p: { type: StatementType }): p is ObjectExpression {
  return p.type === Syntax.ObjectExpression;
}

export class ObjectPattern {
  readonly type: StatementType;
  readonly properties: ObjectPatternProperty[];
  constructor(properties: ObjectPatternProperty[]) {
    this.type = Syntax.ObjectPattern;
    this.properties = properties;
  }
}

export function isObjectPattern(p: { type: StatementType }): p is ObjectPattern {
  return p.type === Syntax.ObjectPattern;
}

export class Property {
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
}

export class RegexLiteral {
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
}

export class RestElement {
  type: StatementType;
  argument: BindingIdentifier | BindingPattern | ReinterpretedExpressionPattern;
  constructor(argument: BindingIdentifier | BindingPattern | ReinterpretedExpressionPattern) {
    this.type = Syntax.RestElement;
    this.argument = argument;
  }
}

export function isRestElement(p: { type: StatementType }): p is RestElement {
  return p.type === Syntax.RestElement;
}

export class RestProperty {
  type: StatementType;
  argument: Expression;
  constructor(argument: Expression) {
    this.type = Syntax.RestProperty;
    this.argument = argument;
  }
}

export function isRestProperty(p: { type: StatementType }): p is RestProperty {
  return p.type === Syntax.RestProperty;
}

export class ReturnStatement {
  readonly type: StatementType;
  readonly argument: Expression | null;
  constructor(argument: Expression | null) {
    this.type = Syntax.ReturnStatement;
    this.argument = argument;
  }
}

export class Script {
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
}

export class SequenceExpression {
  readonly type: StatementType;
  readonly expressions: Expression[];
  constructor(expressions: Expression[]) {
    this.type = Syntax.SequenceExpression;
    this.expressions = expressions;
  }
}

export function isSequenceExpression(p: { type: StatementType }): p is SequenceExpression {
  return p.type === Syntax.SequenceExpression;
}

export class SpreadElement implements BaseNodeWithoutComments {
  type: StatementType;
  readonly argument: Expression;
  constructor(argument: Expression) {
    this.type = Syntax.SpreadElement;
    this.argument = argument;
  }
}

export function isSpreadElement(p: { type: StatementType }): p is SpreadElement {
  return p.type === Syntax.SpreadElement;
}

export class SpreadProperty {
  readonly type: StatementType;
  readonly argument: Expression;
  constructor(argument: Expression) {
    this.type = Syntax.SpreadProperty;
    this.argument = argument;
  }
}

export function isSpreadProperty(p: { type: StatementType }): p is SpreadProperty {
  return p.type === Syntax.SpreadProperty;
}

export class StaticMemberExpression {
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
}

export class Super {
  readonly type: StatementType;
  constructor() {
    this.type = Syntax.Super;
  }
}

export class SwitchCase {
  readonly type: StatementType;
  readonly test: Expression;
  readonly consequent: Statement[];
  constructor(test: Expression, consequent: Statement[]) {
    this.type = Syntax.SwitchCase;
    this.test = test;
    this.consequent = consequent;
  }
}

export class SwitchStatement {
  readonly type: StatementType;
  readonly discriminant: Expression;
  readonly cases: SwitchCase[];
  constructor(discriminant: Expression, cases: SwitchCase[]) {
    this.type = Syntax.SwitchStatement;
    this.discriminant = discriminant;
    this.cases = cases;
  }
}

export class TaggedTemplateExpression {
  readonly type: StatementType;
  readonly tag: Expression;
  readonly quasi: TemplateLiteral;
  constructor(tag: Expression, quasi: TemplateLiteral) {
    this.type = Syntax.TaggedTemplateExpression;
    this.tag = tag;
    this.quasi = quasi;
  }
}

export interface TemplateElementValue {
  cooked: string;
  raw: string;
}

export class TemplateElement {
  readonly type: StatementType;
  readonly value: TemplateElementValue;
  readonly tail: boolean;
  constructor(value: TemplateElementValue, tail: boolean) {
    this.type = Syntax.TemplateElement;
    this.value = value;
    this.tail = tail;
  }
}

export class TemplateLiteral {
  readonly type: StatementType;
  readonly quasis: TemplateElement[];
  readonly expressions: Expression[];
  constructor(quasis: TemplateElement[], expressions: Expression[]) {
    this.type = Syntax.TemplateLiteral;
    this.quasis = quasis;
    this.expressions = expressions;
  }
}

export class ThisExpression {
  readonly type: StatementType;
  constructor() {
    this.type = Syntax.ThisExpression;
  }
}

export class ThrowStatement {
  readonly type: StatementType;
  readonly argument: Expression;
  constructor(argument: Expression) {
    this.type = Syntax.ThrowStatement;
    this.argument = argument;
  }
}

export class TryStatement {
  readonly type: StatementType;
  readonly block: BlockStatement;
  readonly handler: CatchClause | null;
  readonly finalizer: BlockStatement | null;
  constructor(block: BlockStatement, handler: CatchClause | null, finalizer: BlockStatement | null) {
    this.type = Syntax.TryStatement;
    this.block = block;
    this.handler = handler;
    this.finalizer = finalizer;
  }
}

export class UnaryExpression {
  readonly type: StatementType;
  readonly operator: string;
  readonly argument: Expression;
  readonly prefix: boolean;
  constructor(operator: string, argument: Expression) {
    this.type = Syntax.UnaryExpression;
    this.operator = operator;
    this.argument = argument;
    this.prefix = true;
  }
}

export type UpdateOperator = "++" | "--"

export class UpdateExpression {
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

export class VariableDeclarator {
  readonly type: StatementType;
  readonly id: BindingIdentifier | BindingPattern;
  readonly init: Expression | null;
  constructor(id: BindingIdentifier | BindingPattern, init: Expression | null) {
    this.type = Syntax.VariableDeclarator;
    this.id = id;
    this.init = init;
  }
}

export class WhileStatement {
  readonly type: StatementType;
  readonly test: Expression;
  body: Statement;
  constructor(test: Expression, body: Statement) {
    this.type = Syntax.WhileStatement;
    this.test = test;
    this.body = body;
  }
}

export class WithStatement {
  readonly type: StatementType;
  readonly object: Expression;
  readonly body: Statement;
  constructor(object: Expression, body: Statement) {
    this.type = Syntax.WithStatement;
    this.object = object;
    this.body = body;
  }
}

export class YieldExpression {
  type: StatementType;
  argument: Expression | null;
  delegate: boolean;
  constructor(argument: Expression | null, delegate: boolean) {
    this.type = Syntax.YieldExpression;
    this.argument = argument;
    this.delegate = delegate;
  }
}

export function isYieldExpression(p: { type: StatementType }): p is YieldExpression {
  return p.type === Syntax.YieldExpression;
}
