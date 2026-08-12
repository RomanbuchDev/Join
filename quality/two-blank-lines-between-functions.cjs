"use strict";

const REQUIRED_BLANK_LINES = 2;
const FUNCTION_VALUES = new Set([
  "ArrowFunctionExpression",
  "FunctionExpression",
]);

function unwrapExport(node) {
  return node.declaration || node;
}

function isFunctionVariable(node) {
  if (node.type !== "VariableDeclaration") {
    return false;
  }
  return node.declarations.some(
    ({ init }) => init && FUNCTION_VALUES.has(init.type),
  );
}

function isFunctionLike(node) {
  const target = unwrapExport(node);
  return (
    target.type === "FunctionDeclaration" ||
    target.type === "MethodDefinition" ||
    isFunctionVariable(target)
  );
}

function countBlankLines(previous, next) {
  return next.loc.start.line - previous.loc.end.line - 1;
}

function buildFix(previous, next) {
  const indentation = " ".repeat(next.loc.start.column);
  const whitespace = `\n\n\n${indentation}`;
  return (fixer) =>
    fixer.replaceTextRange([previous.range[1], next.range[0]], whitespace);
}

function checkPair(context, previous, next) {
  if (!isFunctionLike(previous) || !isFunctionLike(next)) {
    return;
  }
  const actual = countBlankLines(previous, next);
  if (actual !== REQUIRED_BLANK_LINES) {
    context.report({
      node: next,
      messageId: "spacing",
      data: { actual },
      fix: buildFix(previous, next),
    });
  }
}

function checkBody(context, node) {
  node.body.forEach((current, index) => {
    if (index > 0) {
      checkPair(context, node.body[index - 1], current);
    }
  });
}

const rule = {
  meta: {
    type: "layout",
    fixable: "whitespace",
    schema: [],
    messages: {
      spacing:
        "Zwischen Funktionen sind genau 2 Leerzeilen nötig; gefunden: {{actual}}.",
    },
  },
  create(context) {
    return {
      Program: (node) => checkBody(context, node),
      ClassBody: (node) => checkBody(context, node),
    };
  },
};

module.exports = {
  rules: {
    "two-blank-lines-between-functions": rule,
  },
};
