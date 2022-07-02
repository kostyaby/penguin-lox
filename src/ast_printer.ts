import * as expr from "./expr";

export class AstPrinter implements expr.Visitor<string> {
  print(expression: expr.Expression): string {
    return expression.accept(this);
  }

  visitAssignmentExpression(expression: expr.AssignmentExpression): string {
    return this.parenthesize(
      `assign ${expression.name.lexeme}`,
      expression.value
    );
  }

  visitUnaryExpression(expression: expr.UnaryExpression): string {
    return this.parenthesize(expression.operator.lexeme, expression.right);
  }

  visitBinaryExpression(expression: expr.BinaryExpression): string {
    return this.parenthesize(
      expression.operator.lexeme,
      expression.left,
      expression.right
    );
  }

  visitGroupingExpression(expression: expr.GroupingExpression): string {
    return this.parenthesize("group", expression.expression);
  }

  visitLiteralExpression(expression: expr.LiteralExpression): string {
    if (expression.value === null) {
      return "nil";
    }

    return JSON.stringify(expression.value);
  }

  visitVariableExpression(expression: expr.VariableExpression): string {
    return this.parenthesize(`var ${expression.name.lexeme}`);
  }

  private parenthesize(
    name: string,
    ...expressions: expr.Expression[]
  ): string {
    let result = `(${name}`;
    for (const expression of expressions) {
      result += " ";
      result += expression.accept(this);
    }
    result += ")";

    return result;
  }
}
