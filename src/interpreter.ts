import * as expr from "./expr";
import { Token, TokenType } from "./token";
import { RuntimeError } from "./runtime_error";
import { ErrorSink } from "./error_sink";

import * as _ from "lodash";

export class Interpreter extends expr.Visitor<any> {
  constructor(private readonly errorSink: ErrorSink) {
    super();
  }

  interpret(expression: expr.Expression): void {
    try {
      const value = this.evaluate(expression);
      console.log(JSON.stringify(value));
    } catch (err) {
      if (err instanceof RuntimeError) {
        this.errorSink.runtimeError(err);
      } else {
        // ???
      }
    }
  }

  evaluate(expression: expr.Expression): any {
    return expression.accept(this);
  }

  visitUnaryExpression(expression: expr.UnaryExpression): any {
    const right = this.evaluate(expression.right);

    switch (expression.operator.type) {
      case TokenType.BANG: {
        // Should we only accept a boolean here?
        return !this.isTruthy(right);
      }

      case TokenType.MINUS: {
        this.checkNumberOperand(expression.operator, right);
        return -_.toNumber(right);
      }
    }

    throw new RuntimeError(expression.operator, "Invalid unary expression!");
  }

  visitBinaryExpression(expression: expr.BinaryExpression): any {
    const left = this.evaluate(expression.left);
    const right = this.evaluate(expression.right);

    switch (expression.operator.type) {
      case TokenType.GREATER: {
        this.checkNumberOperands(expression.operator, left, right);
        return left > right;
      }

      case TokenType.GREATER_EQUAL: {
        this.checkNumberOperands(expression.operator, left, right);
        return left >= right;
      }

      case TokenType.LESS: {
        this.checkNumberOperands(expression.operator, left, right);
        return left < right;
      }

      case TokenType.LESS_EQUAL: {
        this.checkNumberOperands(expression.operator, left, right);
        return left <= right;
      }

      case TokenType.BANG_EQUAL: {
        return !this.isEqual(left, right);
      }

      case TokenType.EQUAL_EQUAL: {
        return this.isEqual(left, right);
      }

      case TokenType.MINUS: {
        this.checkNumberOperands(expression.operator, left, right);
        return left - right;
      }

      case TokenType.PLUS: {
        if (_.isNumber(left) && _.isNumber(right)) {
          return left + right;
        }

        if (_.isString(left) && _.isString(right)) {
          return left + right;
        }

        throw new RuntimeError(
          expression.operator,
          "Operands must be two numbers or two strings!"
        );
      }

      case TokenType.SLASH: {
        this.checkNumberOperands(expression.operator, left, right);
        return left / right;
      }

      case TokenType.STAR: {
        this.checkNumberOperands(expression.operator, left, right);
        return left * right;
      }
    }

    throw new RuntimeError(expression.operator, "Invalid binary expression!");
  }

  visitGroupingExpression(expression: expr.GroupingExpression): any {
    return this.evaluate(expression.expression);
  }

  visitLiteralExpression(expression: expr.LiteralExpression): any {
    return expression.value;
  }

  private isTruthy(value: any): boolean {
    // Lox follows Ruby's semantics: `false` and `nil` are falsey, everything
    // else is truthy.
    if (value === null || value === false) {
      return false;
    }

    return true;
  }

  private isEqual(left: any, right: any): boolean {
    return _.isEqual(left, right);
  }

  private checkNumberOperand(operator: Token, operand: any): void {
    if (_.isNumber(operand)) {
      return;
    }

    throw new RuntimeError(operator, "Operand must be a number!");
  }

  private checkNumberOperands(operator: Token, left: any, right: any): void {
    if (_.isNumber(left) && _.isNumber(right)) {
      return;
    }

    throw new RuntimeError(operator, "Operands must be numbers!");
  }
}
