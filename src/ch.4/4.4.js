import { error, is_boolean, is_string, parse, head, tail, stringify } from "sicp";
import { elem_at_i } from "../utils/lists.js";
import { assert } from "../utils/tests.js";

const isLogicalComposition = (tagged_list) => {
  return head(tagged_list) === "logical_composition";
};

const isAnd = (operator) => operator === "&&";

const getOperator = (tagged_list) => {
  const operator = elem_at_i(1, tagged_list);

  if (!is_string(operator)) {
    return error(tagged_list, "Unknown operator in getOperator");
  }

  return operator;
};

const getOperands = (tagged_list) => {
  const operands = tail(tail(tagged_list));

  if (operands.length !== 2) {
    return error(tagged_list, "Incorrect number of operands in getOperands");
  }

  return operands;
};

const buildBooleanEvaluator = (operation) => (operands) =>
  operation(evaluate(elem_at_i(0, operands)), evaluate(elem_at_i(1, operands)));

const evaluateAnd = buildBooleanEvaluator((a, b) => a && b);

const isOr = (operator) => operator === "||";

const evaluateOr = buildBooleanEvaluator((a, b) => a || b);

const evaluateLogicalComposition = (tagged_list) => {
  const operator = getOperator(tagged_list);

  if (isAnd(operator)) {
    return evaluateAnd(getOperands(tagged_list));
  }

  if (isOr(operator)) {
    return evaluateOr(getOperands(tagged_list));
  }

  return error(tagged_list, "Unknown operator in evaluateLogicalComposition");
};

const isLiteral = (tagged_list) => {
  return head(tagged_list) === "literal";
};

const evaluateLiteral = (tagged_list) => {
  return elem_at_i(1, tagged_list);
};

const evaluate = (tagged_list) => {
  if (isLogicalComposition(tagged_list)) {
    return evaluateLogicalComposition(tagged_list);
  }

  if (isLiteral(tagged_list)) {
    return evaluateLiteral(tagged_list);
  }

  return error(tagged_list, "Unknown expression type in evaluate");
};

const buildAnswerMaker = (expectation) => (candidate) =>
  candidate === expectation ? "Yes" : "No";

const testIsTrue = buildAnswerMaker(true);

const testIsNull = buildAnswerMaker(null);

const evaluateExpression = (expression) => {
  return evaluate(parse(expression));
};

const logRunner = (candidate, tester, description) => {
  console.log(description);
  console.log(tester(candidate));
};

const testEvaluate = (expression, tester, expectation) => {
  const candidate = evaluateExpression(expression);

  logRunner(
    candidate,
    tester,
    "Is the " + expression + " " + expectation + "?"
  );
};

(() => {
  logRunner(true, testIsTrue, "Is true true?");

  const expAndTrueTrue = "true && true;";
  testEvaluate(expAndTrueTrue, testIsTrue, "true");
  assert(evaluateExpression(expAndTrueTrue));

  const expOrFalseTrue = "false || true;";
  testEvaluate(expOrFalseTrue, testIsTrue, "true");
  assert(evaluateExpression(expOrFalseTrue));

  const expOrFalseNull = "false || null;";
  testEvaluate(expOrFalseTrue, testIsNull, "null");
  const result = evaluateExpression(expOrFalseNull);
  assert(result === null, "Expected null, but got " + stringify(result));
})();
