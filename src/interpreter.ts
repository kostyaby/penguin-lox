import * as expr from "./expr";
import * as stmt from "./stmt";
import { Environment } from "./environment";
import { ErrorSink } from "./error_sink";
import { RuntimeError } from "./runtime_error";
import { Token, TokenType } from "./token";

import * as _ from "lodash";

export class Interpreter implements expr.Visitor<any>, stmt.Visitor<void> {
  constructor(
    private readonly errorSink: ErrorSink,
    private environment: Environment
  ) {}

  interpret(statements: stmt.Statement[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (err) {
      if (err instanceof RuntimeError) {
        this.errorSink.runtimeError(err);
      } else {
        // ???
      }
    }
  }

  execute(statement: stmt.Statement): void {
    statement.accept(this);
  }

  evaluate(expression: expr.Expression): any {
    return expression.accept(this);
  }

  visitAssignmentExpression(expression: expr.AssignmentExpression): any {
    const value = this.evaluate(expression.value);
    this.environment.assign(expression.name, value);
    return value;
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

    throw new RuntimeError(expression.operator, "Invalid unary expression.");
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
          "Operands must be two numbers or two strings."
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

    throw new RuntimeError(expression.operator, "Invalid binary expression.");
  }

  visitGroupingExpression(expression: expr.GroupingExpression): any {
    return this.evaluate(expression.expression);
  }

  visitLiteralExpression(expression: expr.LiteralExpression): any {
    return expression.value;
  }

  visitVariableExpression(expression: expr.VariableExpression): any {
    return this.environment.get(expression.name);
  }

  visitBlockStatement(statement: stmt.BlockStatement): void {
    const previousEnvironment = this.environment;
    try {
      this.environment = new Environment(this.environment);
      for (const innerStatement of statement.statements) {
        this.execute(innerStatement);
      }
    } finally {
      this.environment = previousEnvironment;
    }
  }

  visitExpressionStatement(statement: stmt.ExpressionStatement): void {
    this.evaluate(statement.expression);
  }

  visitPrintStatement(statement: stmt.PrintStatement): void {
    const value = this.evaluate(statement.expression);

    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value)) {
      console.log(value);
    } else if (_.isNil(value)) {
      console.log("nil");
    } else {
      console.log(JSON.stringify(value));
    }
  }

  visitVariableStatement(statement: stmt.VariableStatement): void {
    let value: expr.Expression | null = null;
    if (statement.initializer) {
      value = this.evaluate(statement.initializer);
    }

    this.environment.define(statement.name.lexeme, value);
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

    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(operator: Token, left: any, right: any): void {
    if (_.isNumber(left) && _.isNumber(right)) {
      return;
    }

    throw new RuntimeError(operator, "Operands must be numbers.");
  }
}
