import {
  map,
  display,
  head,
  is_pair,
  parse,
  stringify,
  tail,
  display_list,
  is_string,
} from "sicp";

const string_col = (value) => stringify(value) + ";";

const is_tagged_list = (component) =>
  is_pair(component) && is_string(head(component));
// const has_tag = (component, the_tag) => is_tagged_list(component) && head(component) === the_tag;

// prettifiers
const pretty_args = (args) =>
  args.substring(0, args.length - 1).replaceAll(";", ", ");
const bracketify = (expression) => "(" + expression + ")";
const curlify = (expression) => "{" + expression + "}";

const unparse_function = (input) =>
  raw_unparse(head(input)) +
  bracketify(pretty_args(map(raw_unparse, head(tail(input))).join(",")));

const operations = {
  name: (input) => input[0],
  literal: (input) => String(input[0]),
  application: (input) => unparse_function(input),
  binary_operator_combination: (input) =>
    raw_unparse(head(input[1])) +
    head(input) +
    raw_unparse(head(tail(input[1]))),
  conditional_expression: (input) =>
    raw_unparse(input[0]) +
    " ? " +
    raw_unparse(head(input[1])) +
    " : " +
    raw_unparse(tail(input[1])),
  lambda_expression: (input) =>
    bracketify(raw_unparse(input[0])) + " => " + raw_unparse(input[1]),
  return_statement: (input) => raw_unparse(input[0]) + ";",
  sequence: (input) => raw_unparse(head(input)) + raw_unparse(tail(head(input))),
  function_declaration: (input) =>
    "function " +
    unparse_function(input) +
    curlify("return " + raw_unparse(head(tail(tail(input))))),
};

const unparse_element = (tagged_list) =>
  (
    operations[head(tagged_list)] ??
    (() => display_list(tagged_list, "\ncould not identify:"))
  )(tail(tagged_list));

const raw_unparse = (component) => {
  if (!is_pair(component)) {
    return "";
  }
  if (is_tagged_list(component)) {
    return unparse_element(component);
  }

  return raw_unparse(head(component)) + raw_unparse(tail(component));
};

const unparse = (expression) => raw_unparse(expression);

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
    "f(x);f(y);f(z);",
    "function f(x) { return x * x; }",
  ]) {
    display_unparse(notation);
  }
  display_unparse("function f(x) { return x * x; }");
})();
