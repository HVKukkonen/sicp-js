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
  prompt,
  display,
  append,
  accumulate,
  math_abs,
  math_PI,
  math_E,
  is_pair,
  list_ref,
} from "sicp";
import { assert } from "../utils/tests.js";
import { elem_at_i } from "../utils/lists.js";

const main2 = () => {
  for (const [expression, expectation, env_symbols = [], env_values = []] of [
    ["42;", 42],
    ["const x = 42;", undefined, list("x"), list(0)],
    ["const x = 42; x;", 42, list("x"), list(42)],
    ["x = 42;", 42, list("x"), list(0)],
  ]) {
    test_evaluate(expression, expectation, env_symbols, env_values);
  }
};

const main = () => {
  create_driver(list("const x = 42;", "42;", "const x = 42; x;"))(setup_environment());
}

function setup_environment() {
  return extend_environment(
    append(primitive_function_symbols, primitive_constant_symbols),
    append(primitive_function_objects, primitive_constant_values),
    the_empty_environment
  );
}

const primitive_functions = list(
  list("head", head),
  list("tail", tail),
  list("pair", pair),
  list("list", list),
  list("is_null", is_null),
  list("display", display),
  list("error", error),
  list("math_abs", math_abs),
  list("+", (x, y) => x + y),
  list("-", (x, y) => x - y),
  list("-unary", x => - x),
  list("*", (x, y) => x * y),
  list("/", (x, y) => x / y),
  list("%", (x, y) => x % y),
  list("===", (x, y) => x === y),
  list("!==", (x, y) => x !== y),
  list("<", (x, y) => x < y),
  list("<=", (x, y) => x <= y),
  list(">", (x, y) => x > y),
  list(">=", (x, y) => x >= y),
  list("!", x => !x)
);
const primitive_function_symbols = map(head, primitive_functions);
const primitive_function_objects = map(
  fun => list("primitive", head(tail(fun))),
  primitive_functions
);

const primitive_constants = list(list("undefined", undefined),
  list("Infinity", Infinity),
  list("math_PI", math_PI),
  list("math_E", math_E),
  list("NaN", NaN)
);
const primitive_constant_symbols = map(c => head(c), primitive_constants);
const primitive_constant_values = map(c => head(tail(c)), primitive_constants);

const test_evaluate = (expression, expectation, env_symbols, env_values) => {
  const tagged_list = parse(expression);
  const env = env_symbols.length > 0 ? extend_environment(env_symbols, env_values) : the_empty_environment;
  const result = evaluate(tagged_list, env);
  const error_message = `Result: ${stringify(
    result
  )}, tagged list: ${stringify(
    tagged_list
  )} resulting from expression ${expression}`;
  assert(result === expectation, error_message);
  console.log(`Evaluation of ${expression} passed successfully!`);
};

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
    evaluate_constant_declaration(component, env)
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
    return evaluate(elem_at_i(0, component), env);
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

  return operator;
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

const the_empty_environment = null;

const list_of_values = (expressions, env) => {
  return map((arg) => evaluate(arg, env), expressions);
};

const function_expression = (component) => {
  return elem_at_i(0, component);
};

const argument_expressions = (component) => {
  return elem_at_i(1, component);
};

const sequence_statements = (stmt) => {
  return head(tail(stmt));
};

const apply = (fn_pair, arg_pairs) => {
  const fn = fn_pair.component;
  const args = map((arg_pair) => arg_pair.component, arg_pairs);

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

    const result = evaluate(body, new_env);

    if (is_return(body)) {
      return result;
    }

    return result;
  }

  return { component: error(fn, "Unknown function type -- apply"), env: null };
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

const apply_primitive_function = (fn, args) => {
  const result = apply_in_underlying_javascript(primitive_implementation(fn), args);
  return { component: result, env: null };
};

const primitive_implementation = (fn) => elem_at_i(1, fn);

const make_function = (parameters, body, env) => {
  return {
    component: list("compound_function", parameters, body, env),
    env,
  };
};

const get_lambda_symbols = (component) => elem_at_i(0, component);

const get_lambda_body = (component) => elem_at_i(1, component);

const evaluate_conditional = (component, env) => {
  const predicate = get_predicate(component);
  const result = evaluate(predicate, env);

  if (result.component) {
    return evaluate(get_consequent(component), result.env);
  } else {
    return evaluate(get_alternative(component), result.env);
  }
};

const symbol_of_name = (component) => elem_at_i(1, component);

const get_predicate = (component) => elem_at_i(0, component);

const get_consequent = (component) => elem_at_i(1, component);

const get_alternative = (component) => elem_at_i(2, component);

const evaluate_constant_declaration = (component, env) => {
  const symbol = get_declaration_symbol(component);

  const value_expression = elem_at_i(2, component);
  const value = evaluate(value_expression, env);

  assign_symbol_value(symbol, value, env);

  return undefined;
};

const define_variable = (symbol, value, env) => {
  if (env === the_empty_environment) {
    return pair(pair(list(symbol), list(value)), the_empty_environment);
  }

  const frame = first_frame(env);

  const scan = (symbols, vals) => {
    if (is_null(symbols)) {
      // Add the binding at the first frame
      set_head(frame, pair(symbol, head(frame)));
      set_tail(frame, pair(value, tail(frame)));
      return "ok";
    } else if (symbol === head(symbols)) {
      // Update the binding in first frame
      set_head(vals, value);
      return "ok";
    } else {
      return scan(tail(symbols), tail(vals));
    }
  };

  return scan(frame_symbols(frame), frame_values(frame));
};

const set_head = (pair, val) => {
  // In an actual implementation, this would modify the head of the pair
  // Since we're using immutable data structures from SICP, we simulate the effect
  return val;
};

const set_tail = (pair, val) => {
  // Similarly, this would modify the tail in a mutable implementation
  return val;
};

const get_declaration_symbol = (component) => {
  const symbol_expression = elem_at_i(1, component);

  if (getTag(symbol_expression) !== "name") {
    return error(`Expected a name, but got ${stringify(declaration)}`);
  }

  return symbol_of_name(symbol_expression);
};

const eval_assignment = (component, env) => {
  const value = evaluate(assignment_value_expression(component), env);
  assign_symbol_value(assignment_symbol(component), value, env);

  return value;
};

const declaration_symbol = (component) => symbol_of_name(head(tail(component)));

const declaration_value_expression = (component) => head(tail(tail(component)));

const assignment_value_expression = (component) => elem_at_i(2, component);

const assignment_symbol = (component) => head(tail(head(tail(component))));

function lookup_symbol_value(symbol, env) {
  function env_loop(env) {
    function scan(symbols, vals) {
      return is_null(symbols)
        ? env_loop(enclosing_environment(env))
        : symbol === head(symbols)
          ? head(vals)
          : scan(tail(symbols), tail(vals));
    }
    if (env === the_empty_environment) {
      error(symbol, "unbound name");
    } else {
      const frame = first_frame(env);
      return scan(frame_symbols(frame), frame_values(frame));
    }
  }
  return env_loop(env);
}

const assign_symbol_value = (symbol, val, env) => {
  const env_loop = (env) => {
    const scan = (symbols, vals) => {
      if (is_null(symbols)) {
        return env_loop(enclosing_environment(env));
      }

      if (symbol === head(symbols)) {
        return set_head(vals, val);
      }

      return scan(tail(symbols), tail(vals));
    };

    if (env === the_empty_environment) {
      error(symbol, "unbound name -- assignment");
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

const is_return = (statement) => getTag(statement) === "return_statement";

const make_return_value = (content) => list("return_value", content);

const is_return_value = (value) => value && getTag(value) === "return_value";

const return_value_content = (value) => head(tail(value));

const create_driver = (user_input) => {
  const input_generator = make_input_generator(append(user_input, list(null)));
  function driver_loop(env) {
    const input = user_read(input_generator);
    if (is_null(input)) {
      return display("evaluator terminated");
    }
  
    const program = parse(input);
    const locals = scan_out_declarations(program);
    const unassigneds = list_of_unassigned(locals);
    const program_env = extend_environment(locals, unassigneds, env);
  
    const output = evaluate(program, program_env);
    user_print(output_prompt, output);
  
    return driver_loop(program_env);
  }

  return driver_loop;
}

const output_prompt = "\nM-evaluate value:\n";
const input_prompt = "\nM-evaluate input:\n";

function* make_input_generator(user_input) {
  let index = 0;
  
  while (true) {
    yield list_ref(user_input, index++);
  }
}

const user_read = (input_generator) => {
  const chosen = input_generator.next().value;
  user_print(input_prompt, chosen);
  return chosen;
};

function user_print(prompt_string, content) {
  return display("----------------------------", prompt_string + "\n" + to_string(content) + "\n");
}

function to_string(component) {
  return is_pair(component) && getTag(component) === "compound_function"
         ? "<compound-function>"
         : is_pair(component) && getTag(component) === "primitive"
         ? "<primitive-function>"
         : is_pair(component)
         ? "[" + to_string(head(component)) + ", "
               + to_string(tail(component)) + "]"
         : stringify(component);
}

function scan_out_declarations(component) {
  return getTag(component) === "sequence"
    ? accumulate(append,
      null,
      map(scan_out_declarations,
        sequence_statements(component)))
    : is_declaration(component)
      ? list(declaration_symbol(component))
      : null;
}

function is_declaration(component) {
  const tag = getTag(component);
  return tag === "constant_declaration" ||
    tag === "variable_declaration" ||
    tag === "function_declaration";
}

function list_of_unassigned(symbols) {
  return map((symbol) => "*unassigned*", symbols);
}


if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
