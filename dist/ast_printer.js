"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstPrinter = void 0;
const expr = __importStar(require("./expr"));
class AstPrinter extends expr.Visitor {
    print(expression) {
        return expression.accept(this);
    }
    visitUnaryExpression(expression) {
        return this.parenthesize(expression.operator.lexeme, expression.right);
    }
    visitBinaryExpression(expression) {
        return this.parenthesize(expression.operator.lexeme, expression.left, expression.right);
    }
    visitGroupingExpression(expression) {
        return this.parenthesize("group", expression.expression);
    }
    visitLiteralExpression(expression) {
        if (expression.value === null) {
            return "nil";
        }
        return JSON.stringify(expression.value);
    }
    parenthesize(name, ...expressions) {
        let result = `(${name}`;
        for (const expression of expressions) {
            result += " ";
            result += expression.accept(this);
        }
        result += ")";
        return result;
    }
}
exports.AstPrinter = AstPrinter;
