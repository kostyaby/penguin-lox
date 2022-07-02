import { Token, TokenType } from "./token";

export interface Expression {
  accept<R>(visitor: Visitor<R>): R;
}

export interface Visitor<R> {
  visitAssignmentExpression(expression: AssignmentExpression): R;
  visitUnaryExpression(expression: UnaryExpression): R;
  visitBinaryExpression(expression: BinaryExpression): R;
  visitGroupingExpression(expression: GroupingExpression): R;
  visitLiteralExpression(expression: LiteralExpression): R;
  visitVariableExpression(expression: VariableExpression): R;
}

export class AssignmentExpression implements Expression {
  constructor(readonly name: Token, readonly value: Expression) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAssignmentExpression(this);
  }
}

export class UnaryExpression implements Expression {
  constructor(readonly operator: Token, readonly right: Expression) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitUnaryExpression(this);
  }
}

export class BinaryExpression implements Expression {
  constructor(
    readonly left: Expression,
    readonly operator: Token,
    readonly right: Expression
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBinaryExpression(this);
  }
}

export class GroupingExpression implements Expression {
  constructor(readonly expression: Expression) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGroupingExpression(this);
  }
}

export class LiteralExpression implements Expression {
  constructor(readonly value: any) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLiteralExpression(this);
  }
}

export class VariableExpression implements Expression {
  constructor(readonly name: Token) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVariableExpression(this);
  }
}
