// NOTE: This is a partial implementation of the evaluator. The missing features would follow the same pattern as the ones implemented here.
import {
  parse,
  stringify,
  head,
  tail,
  error,
  list,
  is_null,
  map,
  apply_in_underlying_javascript,
  length,
  pair,
} from "sicp";
import { assert } from "../utils/tests.js";
import { elem_at_i } from "../utils/lists.js";

const main = () => {
  for (const [expression, expectation] of [
    ["42;", 42],
    ["const x = 42;", 42],
    ["const x = 42; x;", 42],
    ["true;", true],
    ["false ? true : true;", true],
    ["if (true) { 42; } else { 0; }", 42],
    ["(x) => x;", list("compound_function", list("x"), "x", {})],
    ["((x) => x)(1);", 1],
    ["function f() { return 42; } f();", 42],
  ]) {
    test_evaluate(expression, expectation);
  }
};

const test_evaluate = (expression, expectation) => {
  const tagged_list = parse(expression);
  const { component, env } = evaluate({ component: tagged_list });
  const error_message = `Result: ${stringify(
    component
  )}, tagged list: ${stringify(
    tagged_list
  )} resulting from expression ${expression}`;
  assert(component === expectation, error_message);
  console.log(`Evaluation of ${expression} passed successfully!`);
};

export const evaluate = ({ component, env }) => {
  const operator = new Operator();
  operator.set("literal", ({ component, env }) => {
    return { component: head(component), env };
  });
  operator.set("name", ({ component, env }) =>
    lookup_symbol_value({ component, env })
  );
  operator.set("constant_declaration", ({ component, env }) =>
    evaluate_constant_declaration({ component, env })
  );
  operator.set("sequence", ({ component, env }) =>
    evaluate_sequence(component, env)
  );
  operator.set("return_statement", ({ component, env }) => {
    return evaluate({ component: elem_at_i(0, component), env });
  });
  operator.set("conditional_expression", ({ component, env }) =>
    evaluate_conditional({ component, env })
  );
  operator.set("conditional_statement", ({ component, env }) =>
    evaluate_conditional({ component, env })
  );
  operator.set("lambda_expression", ({ component, env }) =>
    make_function(
      get_lambda_symbols(component),
      get_lambda_body(component),
      env
    )
  );
  operator.set("application", ({ component, env }) =>
    apply(
      evaluate({ component: function_expression(component), env }),
      list_of_values(argument_expressions(component), env)
    )
  );

  const value = tail(component);

  const chosen_operation = operator.get(getTag(component));
  const final_value = chosen_operation({ component: value, env });
  return final_value;
};

const getTag = (component) => elem_at_i(0, component);

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

const list_of_values = (expressions, env) => {
  return map((arg) => evaluate({ component: arg, env }), expressions);
};

const function_expression = (component) => {
  return elem_at_i(0, component);
};

const argument_expressions = (component) => {
  return elem_at_i(1, component);
};

const apply = (fn_pair, arg_pairs) => {
  const { component: fn } = fn_pair;
  const args = map(({ component }) => component, arg_pairs);

  if (is_primitive_function(fn)) {
    return apply_primitive_function(fn, args);
  }

  if (is_compound_function(fn)) {
    const body = get_function_body(fn);
    const new_env = extend_environment(
      get_function_parameters(fn),
      args,
      get_function_environment(fn)
    );

    const result = evaluate({ component: body, env: new_env });

    if (is_return(body)) {
      return result;
    }
  }

  return error(fn, "Unknown function type -- apply");
};

function extend_environment(symbols, vals, base_env) {
  return length(symbols) === length(vals)
    ? pair(make_frame(symbols, vals), base_env)
    : length(symbols) < length(vals)
    ? error(
        "too many arguments supplied: " +
          stringify(symbols) +
          ", " +
          stringify(vals)
      )
    : error(
        "too few arguments supplied: " +
          stringify(symbols) +
          ", " +
          stringify(vals)
      );
}

function make_frame(symbols, values) {
  return pair(symbols, values);
}

const get_function_parameters = (fn) => elem_at_i(1, fn);

const get_function_body = (fn) => elem_at_i(2, fn);

const get_function_environment = (fn) => elem_at_i(3, fn);

const is_compound_function = (fn) => getTag(fn) === "compound_function";

const is_primitive_function = (fn) => getTag(fn) === "primitive";

const apply_primitive_function = (fn, args) =>
  apply_in_underlying_javascript(primitive_implementation(fn), args);

const primitive_implementation = (fn) => elem_at_i(1, fn);

const make_function = (parameters, body, env) => {
  return {
    component: list("compound_function", parameters, body, env),
    env,
  };
};

const get_lambda_symbols = (component) => elem_at_i(0, component);

const get_lambda_body = (component) => elem_at_i(1, component);

const evaluate_conditional = ({ component, env }) => {
  const predicate = get_predicate(component);
  const { component: predicate_value, new_env } = evaluate({
    component: predicate,
    env,
  });

  if (predicate_value) {
    return evaluate({ component: get_consequent(component), env: new_env });
  }

  return evaluate({ component: get_alternative(component), env: new_env });
};

const get_predicate = (component) => elem_at_i(0, component);

const get_consequent = (component) => elem_at_i(1, component);

const get_alternative = (component) => elem_at_i(2, component);

const evaluate_constant_declaration = ({ component, env }) => {
  const value_expression = elem_at_i(1, component);
  const { component: value, env: new_env } = evaluate({
    component: value_expression,
    env,
  });

  env = new_env ?? {};
  env[get_declaration_symbol(component)] = value;

  return { component: value, env };
};

const get_declaration_symbol = (component) => {
  const symbol_expression = elem_at_i(0, component);

  if (getTag(symbol_expression) !== "name") {
    return error(`Expected a name, but got ${stringify(declaration)}`);
  }

  return elem_at_i(1, symbol_expression);
};

const lookup_symbol_value = ({ component, env }) => {
  const target_symbol = component;
  const env_loop = (env) => {
    const scan = (symbols, vals) => {
      if (is_null(symbols)) {
        return env_loop(enclosing_environment(env));
      }
      if (target_symbol === head(symbols)) {
        return head(vals);
      }
      return scan(tail(symbols), tail(vals));
    };
    if (env === null) {
      error(component, "unbound name");
    } else {
      const frame = first_frame(env);
      return scan(frame_symbols(frame), frame_values(frame));
    }
  };
  return env_loop(env);
};

const first_frame = (env) => head(env);

const frame_symbols = (frame) => head(frame);

const frame_values = (frame) => tail(frame);

const enclosing_environment = (env) => tail(env);

const evaluate_sequence = (statements, env) => {
  statements = head(statements);
  if (is_null(statements)) {
    return { component: undefined, env };
  }

  const component = head(statements);
  const { component: first_value, env: new_env } = evaluate({ component, env });
  if (is_return(component) || is_last(statements)) {
    return { component: first_value, new_env };
  }

  return evaluate_sequence(list(tail(statements)), new_env);
};

const is_last = (statements) => is_null(tail(statements));

const is_return = (statement) => getTag(statement) === "return_statement";

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
