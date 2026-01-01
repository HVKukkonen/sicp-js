// NOTE The evaluator here is -- with small modifications -- the one provided
// in the book.
import {
  head,
  tail,
  error,
  list,
  is_null,
  list_ref,
} from "sicp";
import { create_driver, setup_environment, execute } from "./driver_loop.js";
import {
  getTag,
  declaration_symbol,
  extend_environment,
  sequence_statements,
  symbol_of_name,
  scan_out_declarations,
  list_of_unassigned,
  is_tagged_list,
  make_frame,
  list_of_values,
  assign_symbol_value,
  lookup_symbol_value,
  assignment_symbol,
  get_lambda_symbols,
  make_function,
  apply,
  function_decl_to_constant_decl,
  unary_operator_combination_to_application,
  binary_operator_combination_to_application
} from "./eval_utils.js";
import { is_truthy } from "../utils/tests.js";

const main = () => {
  test_evaluator(create_operator(), execute, make_frame);
}

export const test_evaluator = (operator, execute, make_frame) => {
  const input = list(
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
    'const p = (x) => { x = x * x; }; p(2);'
  );
  const expectation = list(1, undefined, 2, 3, 4, 5, 6, 7, undefined, true, 42, undefined);
  const driver = create_driver(input, operator, expectation, execute);
  driver(setup_environment(make_frame), list());
};

export const create_operator = () => {
  const operator = new Operator();

  operator.set("literal", (evaluate) => (component, env) => {
    return head(tail(component));
  });
  operator.set("name", (evaluate) => (component, env) =>
    lookup_symbol_value(symbol_of_name(component), env)
  );
  operator.set("constant_declaration", (evaluate) => (component, env) =>
    evaluate_declaration(evaluate)(component, env)
  );
  operator.set("variable_declaration", (evaluate) => (component, env) =>
    evaluate_declaration(evaluate)(component, env)
  );
  operator.set("assignment", (evaluate) => (component, env) => {
    const value = evaluate(list_ref(component, 2), env);
    assign_symbol_value(assignment_symbol(component), value, env);
    return value;
  });
  operator.set("sequence", (evaluate) => (component, env) =>
    evaluate_sequence(evaluate)(sequence_statements(component), env)
  );
  operator.set("return_statement", (evaluate) => (component, env) => {
    return evaluate_return(evaluate)(component, env);
  });
  operator.set("conditional_expression", (evaluate) => (component, env) =>
    evaluate_conditional(evaluate)(component, env)
  );
  operator.set("conditional_statement", (evaluate) => (component, env) =>
    evaluate_conditional(evaluate)(component, env)
  );
  operator.set("lambda_expression", (evaluate) => (component, env) =>
    make_function(
      get_lambda_symbols(component),
      get_lambda_body(component),
      env
    )
  );
  operator.set("application", (evaluate) => (component, env) =>
    apply(evaluate)(
      evaluate(function_expression(component), env),
      list_of_values(evaluate)(argument_expressions(component), env)
    )
  );
  operator.set("block", (evaluate) => (component, env) => {
    return evaluate_block(evaluate)(component, env);
  });
  operator.set("function_declaration", (evaluate) => (component, env) => {
    return evaluate(function_decl_to_constant_decl(component), env);
  });
  operator.set("unary_operator_combination", (evaluate) => (component, env) => {
    return evaluate(unary_operator_combination_to_application(component), env);
  });
  operator.set("binary_operator_combination", (evaluate) => (component, env) => {
    return evaluate(binary_operator_combination_to_application(component), env);
  });

  return operator;
};

class Operator {
  operations = {};

  get(tag) {
    if (!this.operations[tag]) {
      return error(`Unknown tag "${tag}"`);
    }
    return this.operations[tag];
  }

  set(tag, create_operation) {
    this.operations[tag] = create_operation(this.evaluate);
  }

  evaluate = (component, env) => {
    const chosen_operation = this.get(getTag(component));

    return chosen_operation(component, env);
  };
}

const evaluate_block = (evaluate) => (component, env) => {
  const body = list_ref(component, 1);
  const locals = scan_out_declarations(body);
  const unassigneds = list_of_unassigned(locals);
  return evaluate(body, extend_environment(locals, unassigneds, env));
}

const function_expression = (component) => list_ref(component, 1);

const argument_expressions = (component) => list_ref(component, 2);

const evaluate_return = (evaluate) => (component, env) => list("return_value",
  evaluate(list_ref(component, 1), env)
);

const get_lambda_body = (component) => list_ref(component, 2);

const evaluate_conditional = (evaluate) => (component, env) => {
  const predicate = list_ref(component, 1);
  const result = evaluate(predicate, env);

  if (is_truthy(result)) {
    const consequent = list_ref(component, 2);
    return evaluate(consequent, env);
  }

  const alternative = list_ref(component, 3);
  return evaluate(alternative, env);
};

const evaluate_declaration = (evaluate) => (component, env) => {
  const symbol = declaration_symbol(component);

  const value_expression = list_ref(component, 2);
  const value = evaluate(value_expression, env);

  assign_symbol_value(symbol, value, env);

  return undefined;
};

const evaluate_sequence = (evaluate) => (stmts, env) => {
  if (is_null(stmts)) {
    return undefined;
  }
  if (is_last(stmts)) {
    return evaluate(head(stmts), env);
  }

  const first_stmt_value = evaluate(head(stmts), env);

  if (is_tagged_list(first_stmt_value, "return_value")) {
    return first_stmt_value;
  }

  return evaluate_sequence(evaluate)(tail(stmts), env);
};

const is_last = (statements) => is_null(tail(statements));

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
