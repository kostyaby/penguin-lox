"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Visitor = exports.LiteralExpression = exports.GroupingExpression = exports.BinaryExpression = exports.UnaryExpression = void 0;
class UnaryExpression {
    operator;
    right;
    constructor(operator, right) {
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) {
        return visitor.visitUnaryExpression(this);
    }
}
exports.UnaryExpression = UnaryExpression;
class BinaryExpression {
    left;
    operator;
    right;
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) {
        return visitor.visitBinaryExpression(this);
    }
}
exports.BinaryExpression = BinaryExpression;
class GroupingExpression {
    expression;
    constructor(expression) {
        this.expression = expression;
    }
    accept(visitor) {
        return visitor.visitGroupingExpression(this);
    }
}
exports.GroupingExpression = GroupingExpression;
class LiteralExpression {
    value;
    constructor(value) {
        this.value = value;
    }
    accept(visitor) {
        return visitor.visitLiteralExpression(this);
    }
}
exports.LiteralExpression = LiteralExpression;
class Visitor {
    visitUnaryExpression(expression) {
        throw new Error("Not implemented!");
    }
    visitBinaryExpression(expression) {
        throw new Error("Not implemented!");
    }
    visitGroupingExpression(expression) {
        throw new Error("Not implemented!");
    }
    visitLiteralExpression(expression) {
        throw new Error("Not implemented!");
    }
}
exports.Visitor = Visitor;
