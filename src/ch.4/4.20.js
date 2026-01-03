// The exercise builds on the facilities provided in 4.3 to add support
// for while loops similar to 4.7. This time the evaluation is divided into
// two parts; analysis and evaluation.
// The analysis step is responsible for converting the abstract syntax tree
// representation of the components into proper JS functions
// that can be applied directly.
import { error, map, head, tail, is_null, list, parse, list_ref, display } from "sicp";
import { is_truthy } from "../utils/tests.js";
import {
  assign_symbol_value,
  make_frame,
  scan_out_declarations,
  list_of_unassigned,
  extend_environment,
  lookup_symbol_value,
  symbol_of_name,
  assignment_symbol,
  declaration_symbol,
  is_tagged_list,
  sequence_statements,
  get_lambda_symbols,
  make_function,
  function_decl_to_constant_decl,
  unary_operator_combination_to_application,
  binary_operator_combination_to_application,
  create_apply
} from "./eval_utils.js";
import { create_combined_driver, setup_environment } from "./driver_loop.js"
import { while_factorial, reference_factorial } from "./4.7.js";

function analyze_literal(component) {
  return env => head(tail(component));
}

function analyze_name(component) {
  return env => lookup_symbol_value(symbol_of_name(component), env);
}

function analyze_assignment(component) {
  const symbol = assignment_symbol(component);
  const vfun = analyze(list_ref(component, 2));
  return env => {
    const value = vfun(env);
    assign_symbol_value(symbol, value, env);
    return value;
  };
}
function analyze_declaration(component) {
  const symbol = declaration_symbol(component);
  const value_expression = list_ref(component, 2);
  const vfun = analyze(value_expression);
  return env => {
    assign_symbol_value(symbol, vfun(env), env);
    return undefined;
  };
}

function analyze_conditional(component) {
  const predicate = list_ref(component, 1);
  const pfun = analyze(predicate);
  const consequent = list_ref(component, 2);
  const cfun = analyze(consequent);
  const alternative = list_ref(component, 3);
  const afun = analyze(alternative);
  return env => is_truthy(pfun(env)) ? cfun(env) : afun(env);
}

function analyze_lambda_expression(component) {
  const params = get_lambda_symbols(component);
  const body = list_ref(component, 2);
  const bfun = analyze(body);
  return env => make_function(params, bfun, env);
}

function analyze_sequence(stmts) {
  function sequentially(fun1, fun2) {
    return env => {
      const fun1_val = fun1(env);
      return is_tagged_list(fun1_val, "return_value")
        ? fun1_val
        : fun2(env);
    };
  }
  function loop(first_fun, rest_funs) {
    return is_null(rest_funs)
      ? first_fun
      : loop(sequentially(first_fun, head(rest_funs)),
        tail(rest_funs));
  }
  const funs = map(analyze, stmts);
  return is_null(funs)
    ? env => undefined
    : loop(head(funs), tail(funs));
}

function analyze_block(component) {
  const body = list_ref(component, 1);
  const bfun = analyze(body);
  const locals = scan_out_declarations(body);
  const unassigneds = list_of_unassigned(locals);
  return env => bfun(extend_environment(locals, unassigneds, env));
}

function analyze_return_statement(component) {
  const expression = list_ref(component, 1);
  const rfun = analyze(expression);
  return env => list("return_value", rfun(env));
}

function analyze_application(component) {
  const function_expression = list_ref(component, 1);
  const ffun = analyze(function_expression);
  const argument_expressions = list_ref(component, 2);
  const afuns = map(analyze, argument_expressions);
  return env => apply(
    ffun(env),
    map(afun => afun(env), afuns)
  );
}

// The key difference to the apply in 4.3 is the direct application of the function body
// without an evaluation step.
// In 4.3 the body is at application time still an abstract syntax tree representation
// whereas here it is already been analyzed into a function.
const apply = create_apply((body, env) => body(env), (value) => is_tagged_list(value, "return_value"));


const execute_program = (input_program, env) => {
  const ast = parse(input_program);
  const locals = scan_out_declarations(ast);
  const unassigneds = list_of_unassigned(locals);
  env = extend_environment(locals, unassigneds, env);
  
  const output = evaluate(ast, env);
  
  return { output, env }
}

const evaluate = (ast, env) => analyze(ast)(env)

const analyze = (component) => {
  if (is_tagged_list(component, "literal")) return analyze_literal(component);
  if (is_tagged_list(component, "name")) return analyze_name(component);
  if (is_tagged_list(component, "application")) {
    return analyze_application(component);
  };
  if (is_tagged_list(component, "unary_operator_combination")) return analyze(unary_operator_combination_to_application(component));
  if (is_tagged_list(component, "binary_operator_combination")) return analyze(binary_operator_combination_to_application(component));
  if (is_tagged_list(component, "conditional_expression")) return analyze_conditional(component);
  if (is_tagged_list(component, "conditional_statement")) return analyze_conditional(component);
  if (is_tagged_list(component, "lambda_expression")) {
    return analyze_lambda_expression(component);
  };
  if (is_tagged_list(component, "sequence")) return analyze_sequence(sequence_statements(component));
  if (is_tagged_list(component, "block")) return analyze_block(component);
  if (is_tagged_list(component, "return_statement")) {
    return analyze_return_statement(component);
  };
  if (is_tagged_list(component, "function_declaration")) {
    return analyze(function_decl_to_constant_decl(component));
  };
  if (is_tagged_list(component, "constant_declaration")) return analyze_declaration(component);
  if (is_tagged_list(component, "variable_declaration")) return analyze_declaration(component);
  if (is_tagged_list(component, "assignment")) return analyze_assignment(component);

  // the new syntax to add for this exercise
  if (is_tagged_list(component, "while_loop")) return analyze_while_loop(component);

  return error(component, "unknown syntax -- analyze");
}

const analyze_while_loop = (component) => {
  const predicate = list_ref(component, 1);
  const pfun = analyze(predicate);
  const block = list_ref(component, 2);
  const bfun = analyze(block);
  return env => while_loop(pfun, bfun)(env);
}

const while_loop = (predicate, block) => (env) => {
  if (predicate(env)) {
    block(env);
    while_loop(predicate, block)(env);
  }
};

const main = () => {
  const input = list(
    // the original test cases from 4.3 to validate the provided implementation
    "1;",
    "const x = 42;",
    "const x = 2; x;",
    "let x = 3; x;",
    "(true) ? 4 : 0;",
    "if (true) { 5; }",
    "const f = x => x; f(6);",
    "const f = () => { const x = 7; return x; }; f();",
    "function f() { return 42; }",
    "!false;",
    "f();",
    'const p = (x) => { x = x * x; }; p(2);',
    // the new test case to validate the while loop implementation
    while_factorial,
    'factorial(3);',
  );
  const expectation = list(1, undefined, 2, 3, 4, 5, 6, 7, undefined, true, 42, undefined, undefined, reference_factorial(3));
  const driver = create_combined_driver(input, expectation, execute_program);
  driver(setup_environment(make_frame), list());

  display('All tests passed!');
}

main();
