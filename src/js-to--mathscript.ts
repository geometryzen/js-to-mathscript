/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ArrayExpression,
  ArrowFunctionExpression,
  AssignmentExpression,
  AssignmentPattern,
  BinaryExpression,
  BinaryOperator,
  BlockStatement,
  CallExpression,
  CatchClause,
  ClassBody,
  ClassDeclaration,
  ClassExpression,
  ConditionalExpression,
  // Config,
  DoWhileStatement,
  ExportNamedDeclaration,
  ExpressionStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  FunctionDeclaration,
  FunctionExpression, generate, GenerateOptions,
  // generate,
  // GenerateOptions,
  // generateRandomId,
  // getLoopProtectorBlocks,
  IfStatement,
  ImportDeclaration,
  ImportSpecifier,
  MethodDefinition, Module,
  // Module,
  NewExpression,

  ObjectExpression, parse, ParseDelegate, ParseOptions,
  // parse as esprimaParse,
  // ParseDelegate,
  // parseModule as esprimaParseModule,
  // ParseOptions,
  // parseScript as esprimaParseScript,
  Property,
  RestElement,
  ReturnStatement, Script,
  // Script,
  SequenceExpression,
  SpreadElement, StatementListItem, StaticMemberExpression,
  // StatementListItem,
  // StaticMemberExpression,
  SwitchCase,
  SwitchStatement, Syntax,
  // Syntax,
  TemplateLiteral,
  ThrowStatement,
  // tokenize as esprimaTokenize,
  TryStatement,
  UnaryExpression,
  UpdateExpression,
  UpdateOperator,
  VariableDeclaration,
  VariableDeclarator,

  WhileStatement,
  YieldExpression
} from './ecmascript/index';

/*
export interface ParseDelegate {
  (node: Node, meta: MetaData): void
}
*/

/**
 * Provides the MathScript module
 */

/**
 * Determines the transformation action for operators.
 */
export interface OperatorTransform {
  /**
   * The nature of the transformation.
   */
  kind: 'rename' | 'function';
  /**
   * The transformed name.
   */
  name: string;
}

/**
 *
 */
export interface TranspileOptions extends ParseOptions {
  timeout?: number;
  noLoopCheck?: boolean;
  operatorOverloading?: boolean;
  namespace: string;
  /**
   * The replacements of unary operators that will be made.
   */
  binOp: { [name: string]: OperatorTransform };
  /**
  * The replacements of unary operators that will be made.
  */
  unaryOp: { [name: string]: OperatorTransform };
}

function transpileTree(code: string, options: TranspileOptions, delegate?: ParseDelegate): Module | Script {
  // console.lg(`transpileTree(code=..., options=${JSON.stringify(options)})`);
  const tree = parse(code, options, delegate);
  // const tree = parseModule(code, options, delegate)
  // console.lg(JSON.stringify(tree, null, 2));
  if (typeof options.timeout === undefined) {
    options.timeout = 1000;
  }
  visit(tree, options);
  return tree;
}

/**
 * This is the function that we export.
 */
export function jsToMathScript(code: string, transpileOptions: TranspileOptions, delegate?: ParseDelegate, generateOptions?: GenerateOptions): { code: string } {
  // console.lg(`transpile(code=${JSON.stringify(code)} transpileOptions=${JSON.stringify(transpileOptions)})`);
  const tree = transpileTree(code, transpileOptions, delegate);
  const generated = generate(tree, generateOptions);
  if (typeof generated === 'string') {
    return { code: generated };
  } else {
    return { code: generated.code };
  }
}

/**
 * Generate 2 ASTs for the code to be inserted in loops for infinite run protection.
 */
export function getLoopProtectorBlocks(varName: string, timeout: number): { before: VariableDeclaration; inside: IfStatement } {
  const ast1 = parse(`var ${varName} = Date.now()`);
  const ast2 = parse(`if (Date.now() - ${varName} > ${timeout}) {throw new Error("Infinite loop suspected after ${timeout} milliseconds.")}`);

  return {
    before: <VariableDeclaration>ast1.body[0],
    inside: <IfStatement>ast2.body[0],
  };
}

const alphaNum = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateRandomId(length = 10) {
  let id = '';
  for (let i = length; i--;) {
    id += alphaNum[~~(Math.random() * alphaNum.length)];
  }
  return id;
}

function addInfiniteLoopProtection(statements: StatementListItem[], millis: number): StatementListItem[] {
  for (let i = statements.length; i--;) {
    const el = statements[i];
    if ((el && el.type === Syntax.ForStatement) || el.type === Syntax.WhileStatement || el.type === Syntax.DoWhileStatement) {
      const loop = <ForStatement | WhileStatement | DoWhileStatement>el;
      const randomVariableName = '_' + generateRandomId(5);
      const insertionBlocks = getLoopProtectorBlocks(randomVariableName, millis);
      // Insert time variable assignment
      statements.splice(i, 0, insertionBlocks.before);
      // If the loop's body is a single statement, then convert it into a block statement
      // so that we can insert our conditional break inside it.
      if (!Array.isArray(loop.body)) {
        loop.body = <BlockStatement>{
          body: [loop.body],
          type: Syntax.BlockStatement,
        };
      }
      const block = <BlockStatement>loop.body;
      // Insert IfStatement
      block.body.unshift(insertionBlocks.inside);
    }
  }
  return statements;
}

/**
 * This code performs the re-writing of the AST for operator overloading.
 * This is actually an in-place mutation of the tree.
 */
function visit(node: { type: string } | null, options: TranspileOptions): void {
  if (node && node.type) {
    switch (node.type) {
      case Syntax.ArrowFunctionExpression: {
        const expr = <ArrowFunctionExpression>node;
        visit(expr.body, options);
        break;
      }
      case Syntax.AssignmentPattern: {
        const pattern = <AssignmentPattern>node;
        visit(pattern.left, options);
        visit(pattern.right, options);
        break;
      }
      case Syntax.BlockStatement: {
        const block = <BlockStatement>node;
        if (options.noLoopCheck) {
          block.body.forEach(function (part) {
            visit(part, options);
          });
        } else {
          const timeout = <number>options.timeout;
          addInfiniteLoopProtection(block.body, timeout).forEach(function (part) {
            visit(part, options);
          });
        }
        break;
      }
      case Syntax.ClassBody: {
        const classBody = <ClassBody>node;
        classBody.body.forEach(function (node) {
          visit(node, options);
        });
        break;
      }
      case Syntax.ClassDeclaration: {
        const classDecl = <ClassDeclaration>node;
        visit(classDecl.body, options);
        break;
      }
      case Syntax.ClassExpression: {
        const classExpr = <ClassExpression>node;
        visit(classExpr.body, options);
        break;
      }
      case Syntax.ExportNamedDeclaration: {
        const decl = <ExportNamedDeclaration>node;
        visit(decl.declaration, options);
        visit(decl.source, options);
        decl.specifiers.forEach(function (s) {
          visit(s, options);
        });
        break;
      }
      case Syntax.ExportSpecifier: {
        break;
      }
      case Syntax.FunctionDeclaration: {
        const funcDecl = <FunctionDeclaration>node;
        funcDecl.params.forEach(function (param) {
          visit(param, options);
        });
        visit(funcDecl.body, options);
        break;
      }
      case Syntax.ImportDeclaration: {
        const decl = <ImportDeclaration>node;
        visit(decl.source, options);
        decl.specifiers.forEach(function (s) {
          visit(s, options);
        });
        break;
      }
      case Syntax.ImportSpecifier: {
        const decl = <ImportSpecifier>node;
        visit(decl.imported, options);
        visit(decl.local, options);
        break;
      }
      case Syntax.Program: {
        const script = <Module | Script>node;
        if (options.noLoopCheck) {
          script.body.forEach(function (node) {
            visit(node, options);
          });
        } else {
          const timeout = <number>options.timeout;
          addInfiniteLoopProtection(script.body, timeout).forEach(function (node) {
            visit(node, options);
          });
        }
        break;
      }
      case Syntax.RestElement: {
        const elem = <RestElement>node;
        visit(elem.argument, options);
        break;
      }
      case Syntax.SpreadElement: {
        const elem = <SpreadElement>node;
        visit(elem.argument, options);
        break;
      }
      case Syntax.Super: {
        break;
      }
      case Syntax.VariableDeclaration: {
        const varDeclaration = <VariableDeclaration>node;
        varDeclaration.declarations.forEach(function (declaration) {
          visit(declaration, options);
        });
        break;
      }
      case Syntax.VariableDeclarator: {
        const varDeclarator = <VariableDeclarator>node;
        if (varDeclarator.init) {
          visit(varDeclarator.init, options);
        }
        break;
      }
      case Syntax.ConditionalExpression: {
        const condExpr = <ConditionalExpression>node;
        visit(condExpr.test, options);
        visit(condExpr.consequent, options);
        visit(condExpr.alternate, options);
        break;
      }
      case Syntax.BinaryExpression:
      case Syntax.LogicalExpression: {
        const binExpr = <BinaryExpression>node;
        if (options.operatorOverloading && binExpr.operator && options.binOp[binExpr.operator]) {
          switch (options.binOp[binExpr.operator].kind) {
            case 'function': {
              const callExpr = <CallExpression>node;
              callExpr.type = Syntax.CallExpression;
              callExpr.callee = {
                type: Syntax.MemberExpression,
                computed: false,
                object: { type: Syntax.Identifier, name: options.namespace },
                property: {
                  type: Syntax.Identifier,
                  name: options.binOp[binExpr.operator].name,
                },
                // Not sure waht this does.
                optional: false
              };
              visit(binExpr.left, options);
              visit(binExpr.right, options);
              callExpr.arguments = [binExpr.left, binExpr.right];
              break;
            }
            case 'rename': {
              // TODO: Type Guard
              binExpr.operator = options.binOp[binExpr.operator].name as BinaryOperator;
            }
          }
        } else {
          visit(binExpr.left, options);
          visit(binExpr.right, options);
        }
        break;
      }
      case Syntax.ExpressionStatement: {
        const exprStmt = <ExpressionStatement>node;
        visit(exprStmt.expression, options);
        break;
      }
      case Syntax.ForStatement: {
        const forStmt = <ForStatement>node;
        visit(forStmt.init, options);
        visit(forStmt.test, options);
        visit(forStmt.update, options);
        visit(forStmt.body, options);
        break;
      }
      case Syntax.ForInStatement: {
        const forIn = <ForInStatement>node;
        visit(forIn.left, options);
        visit(forIn.right, options);
        visit(forIn.body, options);
        break;
      }
      case Syntax.IfStatement: {
        const ifStmt = <IfStatement>node;
        visit(ifStmt.test, options);
        visit(ifStmt.consequent, options);
        visit(ifStmt.alternate, options);
        break;
      }
      case Syntax.ArrayExpression: {
        const arrayExpr = <ArrayExpression>node;
        arrayExpr.elements.forEach(function (elem) {
          visit(elem, options);
        });
        break;
      }
      case Syntax.AssignmentExpression: {
        const assignExpr = <AssignmentExpression>node;
        if (options.operatorOverloading && assignExpr.operator && options.binOp[assignExpr.operator]) {
          visit(assignExpr.left, options);
          visit(assignExpr.right, options);
        } else {
          visit(assignExpr.left, options);
          visit(assignExpr.right, options);
        }
        break;
      }
      case Syntax.CallExpression: {
        const callExpr = <CallExpression>node;
        visit(callExpr.callee, options);
        callExpr.arguments.forEach(function (a) {
          visit(a, options);
        });
        break;
      }
      case Syntax.CatchClause: {
        const catchClause = <CatchClause>node;
        visit(catchClause.param, options);
        visit(catchClause.body, options);
        break;
      }
      case Syntax.DoWhileStatement: {
        const doWhileStmt = <DoWhileStatement>node;
        visit(doWhileStmt.test, options);
        visit(doWhileStmt.body, options);
        break;
      }
      case Syntax.FunctionExpression: {
        const funcExpr = <FunctionExpression>node;
        visit(funcExpr.body, options);
        break;
      }
      case Syntax.ForOfStatement: {
        const stmt = <ForOfStatement>node;
        visit(stmt.left, options);
        visit(stmt.right, options);
        visit(stmt.body, options);
        break;
      }
      case Syntax.MemberExpression: {
        const staticMemberExpr = <StaticMemberExpression>node;
        visit(staticMemberExpr.object, options);
        break;
      }
      case Syntax.MethodDefinition: {
        const methodDef = <MethodDefinition>node;
        visit(methodDef.value, options);
        break;
      }
      /*
      case Syntax.MemberExpression: {
          const computedMemberExpr = <ComputedMemberExpression>node;
          visit(computedMemberExpr.object, options);
          break;
      }
      */
      case Syntax.NewExpression: {
        const newExpr = <NewExpression>node;
        visit(newExpr.callee, options);
        newExpr.arguments.forEach(function (a) {
          visit(a, options);
        });
        break;
      }
      case Syntax.ObjectExpression: {
        const objExpr = <ObjectExpression>node;
        objExpr.properties.forEach(function (p) {
          visit(p, options);
        });
        break;
      }
      case Syntax.ReturnStatement: {
        const returnStmt = <ReturnStatement>node;
        visit(returnStmt.argument, options);
        break;
      }
      case Syntax.SequenceExpression: {
        const seqExpr = <SequenceExpression>node;
        seqExpr.expressions.forEach(function (e) {
          visit(e, options);
        });
        break;
      }
      case Syntax.SwitchCase: {
        const switchCase = <SwitchCase>node;
        visit(switchCase.test, options);
        switchCase.consequent.forEach(function (c) {
          visit(c, options);
        });
        break;
      }
      case Syntax.SwitchStatement: {
        const switchStmt = <SwitchStatement>node;
        visit(switchStmt.discriminant, options);
        switchStmt.cases.forEach(function (kase) {
          visit(kase, options);
        });
        break;
      }
      case Syntax.TemplateElement: {
        // const tempElem = <TemplateElement>node;
        break;
      }
      case Syntax.TemplateLiteral: {
        const tempLit = <TemplateLiteral>node;
        tempLit.quasis.forEach(function (q) {
          visit(q, options);
        });
        tempLit.expressions.forEach(function (expr) {
          visit(expr, options);
        });
        break;
      }
      case Syntax.ThrowStatement: {
        const throwStmt = <ThrowStatement>node;
        visit(throwStmt.argument, options);
        break;
      }
      case Syntax.TryStatement: {
        const tryStmt = <TryStatement>node;
        visit(tryStmt.block, options);
        visit(tryStmt.handler, options);
        visit(tryStmt.finalizer, options);
        break;
      }
      case Syntax.UnaryExpression: {
        const unaryExpr = <UnaryExpression>node;
        if (options.operatorOverloading && unaryExpr.operator && options.unaryOp[unaryExpr.operator]) {
          const callExpr = <CallExpression>node;
          callExpr.type = Syntax.CallExpression;
          callExpr.callee = {
            type: Syntax.MemberExpression,
            computed: false,
            object: {
              type: Syntax.Identifier,
              name: options.namespace,
            },
            property: {
              type: Syntax.Identifier,
              name: options.unaryOp[unaryExpr.operator].name,
            },
            optional: false
          };
          visit(unaryExpr.argument, options);
          callExpr.arguments = [unaryExpr.argument];
        } else {
          visit(unaryExpr.argument, options);
        }
        break;
      }
      // Why do we have code here and not in the Unary expression?
      case Syntax.UpdateExpression: {
        const updateExpr = <UpdateExpression>node;
        if (options.operatorOverloading && updateExpr.operator && options.unaryOp[updateExpr.operator]) {
          switch (options.unaryOp[updateExpr.operator].kind) {
            case 'function': {
              const callExpr = <CallExpression>node;
              callExpr.type = Syntax.CallExpression;
              callExpr.callee = {
                type: Syntax.MemberExpression,
                computed: false,
                object: {
                  type: Syntax.Identifier,
                  name: options.namespace,
                },
                property: {
                  type: Syntax.Identifier,
                  name: options.unaryOp[updateExpr.operator].name,
                },
                optional: false
              };
              visit(updateExpr.argument, options);
              callExpr.arguments = [updateExpr.argument];
              break;
            }
            case 'rename': {
              updateExpr.operator = options.unaryOp[updateExpr.operator].name as UpdateOperator
              visit(updateExpr.argument, options);
              break;
            }
          }
        } else {
          visit(updateExpr.argument, options);
        }
        break;
      }
      case Syntax.Property: {
        const prop = <Property>node;
        visit(prop.key, options);
        visit(prop.value, options);
        break;
      }
      case Syntax.WhileStatement: {
        const whileStmt = <WhileStatement>node;
        visit(whileStmt.test, options);
        visit(whileStmt.body, options);
        break;
      }
      case Syntax.BreakStatement:
      case Syntax.ContinueStatement:
      case Syntax.EmptyStatement:
      case Syntax.Literal:
      case Syntax.Identifier:
      case Syntax.ThisExpression:
      case Syntax.DebuggerStatement: {
        break;
      }
      case Syntax.YieldExpression: {
        const expr = <YieldExpression>node;
        visit(expr.argument, options);
        break;
      }
      default: {
        console.warn(`Unhandled Node: ${node.type}`);
        console.warn(`${JSON.stringify(node, null, 2)}`);
      }
    }
  } else {
    return;
  }
}
