import { Token, TokenType } from "./token";

export interface Expression {
  accept<R>(visitor: Visitor<R>): R;
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

export class Visitor<R> {
  visitUnaryExpression(expression: UnaryExpression): R {
    throw new Error("Not implemented!");
  }

  visitBinaryExpression(expression: BinaryExpression): R {
    throw new Error("Not implemented!");
  }

  visitGroupingExpression(expression: GroupingExpression): R {
    throw new Error("Not implemented!");
  }

  visitLiteralExpression(expression: LiteralExpression): R {
    throw new Error("Not implemented!");
  }
}
