import {
  map,
  display,
  head,
  is_pair,
  parse,
  tail,
  display_list,
  is_string,
  pair,
} from "sicp";

const is_tagged_list = (component) =>
  is_pair(component) && is_string(head(component));

// prettifiers
const pretty_args = (args) =>
  args.substring(0, args.length - 1).replaceAll(";", ", ");
const bracketify = (expression) => "(" + expression + ")";
const curlify = (expression) => "{" + expression + "}";

const unparse_function = (input) =>
  {
    return unparse(head(input)) +
      bracketify(pretty_args(map(unparse, head(tail(input))).join(",")));
  };

const flatten = (tree) => {
  if (!is_pair(tree)) {
    return "";
  }

  return head(tree) + ";" + flatten(tail(tree));
}

const operations = {
  name: (input) => input[0],
  literal: (input) => String(input[0]),
  application: (input) => unparse_function(input),
  binary_operator_combination: (input) =>
    unparse(head(input[1])) +
    head(input) +
    unparse(head(tail(input[1]))),
  conditional_expression: (input) =>
    unparse(input[0]) +
    " ? " +
    unparse(head(input[1])) +
    " : " +
    unparse(tail(input[1])),
  lambda_expression: (input) =>
    bracketify(unparse(input[0])) + " => " + unparse(input[1]),
  return_statement: (input) => "return " + unparse(input[0]),
  sequence: (input) => flatten(map(unparse, input[0])),
  function_declaration: (input) =>
    "function " +
    unparse_function(input) +
    curlify(unparse(head(tail(tail(input))))),
  assignment: (input) => unparse(input[0]) + " = " + unparse(input[1]),
  constant_declaration: (input) => "const " + unparse(pair("assignment", input)),
  block: (input) => unparse(input),
};

const unparse_element = (tagged_list) =>
  (
    operations[head(tagged_list)] ??
    (() => display_list(tagged_list, "\ncould not identify:"))
  )(tail(tagged_list));

const unparse = (component) => {
  if (!is_pair(component)) {
    return "";
  }
  if (is_tagged_list(component)) {
    return unparse_element(component);
  }

  return unparse(head(component)) + unparse(tail(component));
};

(() => {
  const display_unparse = (notation) => {
    display(notation, "input to parse-unparse:");
    display(unparse(parse(notation)), "result:");
  };
  for (const notation of [
    "1;",
    "pi;",
    "fun(x1, x2);",
    "fun(1, 2);",
    "2 + 1;",
    "pi * f(pi);",
    "x === 0 ? x : 0;",
    "(x) => x * x;",
    "f(x);f(y);",
    "fx(x);fy(y);fz(z);",
    "function f(x) { return x * x; }",
    "x = 2;",
    "const x = 1;",
    `function f(x) {
      return x * x;
    }`,
    `function f(x) {
      const y = x * x;
      return y;
    }`,
  ]) {
    display_unparse(notation);
  }
})();
