import * as expr from "./expr";
import { Token, TokenType } from "./token";

export interface Statement {
  accept<R>(visitor: Visitor<R>): R;
}

export interface Visitor<R> {
  visitBlockStatement(statement: BlockStatement): R;
  visitExpressionStatement(statement: ExpressionStatement): R;
  visitPrintStatement(statement: PrintStatement): R;
  visitVariableStatement(statement: VariableStatement): R;
}

export class BlockStatement implements Statement {
  constructor(readonly statements: Statement[]) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBlockStatement(this);
  }
}

export class ExpressionStatement implements Statement {
  constructor(readonly expression: expr.Expression) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitExpressionStatement(this);
  }
}

export class PrintStatement implements Statement {
  constructor(readonly expression: expr.Expression) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitPrintStatement(this);
  }
}

export class VariableStatement implements Statement {
  constructor(
    readonly name: Token,
    readonly initializer: expr.Expression | null
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVariableStatement(this);
  }
}
