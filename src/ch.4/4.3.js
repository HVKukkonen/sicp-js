import {
  head,
  tail,
  error,
  list,
  is_null,
  map,
  apply_in_underlying_javascript,
  set_head,
  is_boolean,
  list_ref,
} from "sicp";
import { create_driver, setup_environment } from "./driver_loop.js";
import { getTag, declaration_symbol, extend_environment, sequence_statements, symbol_of_name, scan_out_declarations, list_of_unassigned } from "./eval_utils.js";

const main = () => {
  const input = list(
    "const x = 42;",
    "1;",
    "const x = 2; x;",
    "let x = 3; x;",
    "(true) ? 4 : 0;",
    "if (true) { 5; }",
    "const f = x => x; f(6);",
    "const f = () => { const x = 7; return x; }; f();",
    "function f() { return 42; }",
    "!false;",
    "f();"
  );
  const expectation = list(undefined, 1, 2, 3, 4, 5, 6, 7, undefined, true, 42);
  const driver = create_driver(input, evaluate, expectation);
  driver(setup_environment(), list());
}

export const evaluate = (component, env) => {
  const operator = create_operator();
  const chosen_operation = operator.get(getTag(component));
  const value = chosen_operation(component, env);

  return value;
};

const create_operator = () => {
  const operator = new Operator();

  operator.set("literal", (component, env) => {
    return head(tail(component));
  });
  operator.set("name", (component, env) =>
    lookup_symbol_value(symbol_of_name(component), env)
  );
  operator.set("constant_declaration", (component, env) =>
    evaluate_declaration(component, env)
  );
  operator.set("variable_declaration", (component, env) =>
    evaluate_declaration(component, env)
  );
  operator.set("assignment", (component, env) => {
    const value = evaluate(assignment_value_expression(component), env);
    assign_symbol_value(assignment_symbol(component), value, env);
    return value;
  });
  operator.set("sequence", (component, env) =>
    evaluate_sequence(sequence_statements(component), env)
  );
  operator.set("return_statement", (component, env) => {
    return evaluate_return(component, env);
  });
  operator.set("conditional_expression", (component, env) =>
    evaluate_conditional(component, env)
  );
  operator.set("conditional_statement", (component, env) =>
    evaluate_conditional(component, env)
  );
  operator.set("lambda_expression", (component, env) =>
    make_function(
      get_lambda_symbols(component),
      get_lambda_body(component),
      env
    )
  );
  operator.set("application", (component, env) =>
    apply(
      evaluate(function_expression(component), env),
      list_of_values(argument_expressions(component), env)
    )
  );
  operator.set("block", (component, env) => {
    return evaluate_block(component, env);
  });
  operator.set("function_declaration", (component, env) => {
    return evaluate(function_decl_to_constant_decl(component), env);
  });
  operator.set("unary_operator_combination", (component, env) => {
    return evaluate(unary_operator_combination_to_application(component), env);
  });
  operator.set("binary_operator_combination", (component, env) => {
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

  set(tag, operation) {
    this.operations[tag] = operation;
  }
}

const the_empty_environment = null;

const unary_operator_combination_to_application = (component) => {
  const operator = list_ref(component, 1);

  return make_application(make_name(operator), list(first_operand(component)));
}

const binary_operator_combination_to_application = (component) => {
  const operator = list_ref(component, 1);

  return make_application(
    make_name(operator),
    list(first_operand(component), second_operand(component))
  );
}

const first_operand = (component) => list_ref(component, 2);

const second_operand = (component) => list_ref(component, 3);

const make_application = (function_expression, argument_expressions) => list("application", function_expression, argument_expressions)

const make_name = (symbol) => list("name", symbol);

const function_decl_to_constant_decl = (component) => {
  const declaration_name = list_ref(component, 1);
  const parameters = list_ref(component, 2);
  const body = list_ref(component, 3);

  return make_constant_declaration(
    declaration_name,
    make_lambda_expression(
      parameters,
      body
    )
  );
}

const make_constant_declaration = (name, value_expression) => {
  return list("constant_declaration", name, value_expression);
}

const make_lambda_expression = (parameters, body) => {
  return list("lambda_expression", parameters, body);
}

const evaluate_block = (component, env) => {
  const body = list_ref(component, 1);
  const locals = scan_out_declarations(body);
  const unassigneds = list_of_unassigned(locals);
  return evaluate(body, extend_environment(locals, unassigneds, env));
}

const list_of_values = (expressions, env) => {
  return map((arg) => evaluate(arg, env), expressions);
};

const function_expression = (component) => list_ref(component, 1);

const argument_expressions = (component) => list_ref(component, 2);

const evaluate_return = (component, env) => make_return_value(
  evaluate(list_ref(component, 1), env)
);

const apply = (fn, args) => {
  if (getTag(fn) === "primitive") {
    return apply_primitive_function(fn, args);
  }

  if (getTag(fn) === "compound_function") {
    const body = list_ref(fn, 2);
    const new_env = extend_environment(
      function_parameters(fn),
      args,
      function_environment(fn)
    );

    const result = evaluate(body, new_env);

    if (is_return(result)) {
      return list_ref(result, 1);
    }

    return undefined;
  }

  return error(fn, "Unknown function type -- apply");
};

const function_parameters = (fn) => list_ref(fn, 1);

const function_environment = (fn) => list_ref(fn, 3);

const apply_primitive_function = (fn, args) => apply_in_underlying_javascript(
  list_ref(fn, 1), args
);

const make_function = (parameters, body, env) => list("compound_function", parameters, body, env);

const get_lambda_symbols = (component) => map(symbol_of_name, list_ref(component, 1));

const get_lambda_body = (component) => list_ref(component, 2);

const evaluate_conditional = (component, env) => {
  const predicate = list_ref(component, 1);
  const result = evaluate(predicate, env);

  if (is_truthy(result)) {
    return evaluate(consequent(component), env);
  }

  return evaluate(alternative(component), env);
};

const consequent = (component) => list_ref(component, 2);

const alternative = (component) => list_ref(component, 3);

const is_truthy = (x) => {
  if (!is_boolean(x)) {
    return error(x, "boolean expected, received");
  }

  return x;
}

const evaluate_declaration = (component, env) => {
  const symbol = declaration_symbol(component);

  const value_expression = list_ref(component, 2);
  const value = evaluate(value_expression, env);

  assign_symbol_value(symbol, value, env);

  return undefined;
};

const assignment_value_expression = (component) => list_ref(component, 2);

const assignment_symbol = (component) => list_ref(list_ref(component, 1), 1);

const lookup_symbol_value = (symbol, env) => {
  const env_loop = (env) => {
    const scan = (symbols, vals) => {
      if (is_null(symbols)) {
        return env_loop(tail(env));
      }

      if (symbol === head(symbols)) {
        return head(vals);
      }

      return scan(tail(symbols), tail(vals));
    }

    if (env === the_empty_environment) {
      return error(symbol, "unbound name");
    }

    const frame = head(env);
    return scan(frame_symbols(frame), frame_values(frame));
  }

  return env_loop(env);
}

const assign_symbol_value = (symbol, val, env) => {
  const env_loop = (env) => {
    const scan = (symbols, vals) => {
      if (is_null(symbols)) {
        return env_loop(tail(env));
      }

      if (symbol === head(symbols)) {
        return set_head(vals, val);
      }

      return scan(tail(symbols), tail(vals));
    };

    if (env === the_empty_environment) {
      return error(symbol, "unbound name -- assignment");
    }

    const frame = head(env);
    return scan(frame_symbols(frame), frame_values(frame));
  };

  return env_loop(env);
};

const frame_symbols = (frame) => head(frame);

const frame_values = (frame) => tail(frame);

const evaluate_sequence = (stmts, env) => {
  if (is_null(stmts)) {
    return undefined;
  }
  if (is_last(stmts)) {
    return evaluate(head(stmts), env);
  }

  const first_stmt_value = evaluate(head(stmts), env);

  if (is_return_value(first_stmt_value)) {
    return first_stmt_value;
  }

  return evaluate_sequence(tail(stmts), env);
};

const is_last = (statements) => is_null(tail(statements));

const is_return = (statement) => getTag(statement) === "return_statement" || is_return_value(statement);

const make_return_value = (content) => list("return_value", content);

const is_return_value = (value) => value && getTag(value) === "return_value";

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
