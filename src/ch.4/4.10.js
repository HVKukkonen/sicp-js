// Solution to both exercises 4.9 and 4.10
// The exercise extends the evaluator from 4.3.
// Some environment operations are refactored to use a shared abstraction.
// This requires rewrite for some dependent operations as well.
// Tests from 4.3 are reused to verify the correctness of the new implementation.
import { is_null, tail, head, error, list_ref, pair, set_tail, parse, apply_in_underlying_javascript } from "sicp";
import { create_operator, test_evaluator, assignment_symbol, is_return } from "./4.3.js";
import {
  declaration_symbol,
  symbol_of_name,
  scan_out_declarations,
  list_of_unassigned,
  create_extend_environment,
  list_of_values,
  getTag,
} from "./eval_utils.js";

const create_env_operator = (symbol, operate) => {
  const env_loop = (env) => {
    const scan = (frame) => {
      if (is_null(frame)) {
        return env_loop(tail(env));
      }

      const current_pair = list_ref(frame, 0);
      const current_symbol = head(current_pair);

      if (symbol === current_symbol) {
        return operate(current_pair);
      }

      return scan(tail(frame));
    }

    if (is_null(env)) {
      return error(symbol, "unbound name");
    }

    const frame = head(env);
    return scan(frame);
  }

  return env_loop;
}

const lookup_symbol_value = (symbol, env) => create_env_operator(
  symbol,
  (pair) => tail(pair)
)(env);

const assign_symbol_value = (symbol, val, env) => create_env_operator(
  symbol,
  (pair) => set_tail(pair, val)
)(env);

const evaluate_declaration = (evaluate) => (component, env) => {
  const symbol = declaration_symbol(component);

  const value_expression = list_ref(component, 2);
  const value = evaluate(value_expression, env);

  assign_symbol_value(symbol, value, env);

  return undefined;
};

export const declaration = (evaluate) => (component, env) =>
  evaluate_declaration(evaluate)(component, env);

export const assignment = (evaluate) => (component, env) => {
  const value = evaluate(list_ref(component, 2), env);
  assign_symbol_value(assignment_symbol(component), value, env);
  return value;
}

export const name = (evaluate) => (component, env) =>
  lookup_symbol_value(symbol_of_name(component), env);

const make_frame = (symbols, values) => {
  if (is_null(symbols) || is_null(values)) {
      return null;
  }
  return pair(pair(head(symbols), head(values)), make_frame(tail(symbols), tail(values)));
}

const extend_environment = create_extend_environment(make_frame);

const apply = (evaluate) => (fn, args) => {
  if (getTag(fn) === "primitive") {
    return apply_in_underlying_javascript(list_ref(fn, 1), args);
  }

  if (getTag(fn) === "compound_function") {
    const function_parameters = list_ref(fn, 1);
    const function_environment = list_ref(fn, 3);
    const new_env = extend_environment(
      function_parameters,
      args,
      function_environment
    );

    const body = list_ref(fn, 2);
    const result = evaluate(body, new_env);

    if (is_return(result)) {
      return list_ref(result, 1);
    }

    return undefined;
  }

  return error(fn, "Unknown function type -- apply");
};

export const application = (evaluate) => (component, env) => {
  const f = evaluate(list_ref(component, 1), env);
  const args = list_of_values(evaluate)(list_ref(component, 2), env);

  return apply(evaluate)(f, args);
};

export const block = (evaluate) => (component, env) => {
  const body = list_ref(component, 1);
  const locals = scan_out_declarations(body);
  const unassigneds = list_of_unassigned(locals);
  return evaluate(body, extend_environment(locals, unassigneds, env));
};

const execute = (input, env, operator) => {
  const program = parse(input);
  const locals = scan_out_declarations(program);
  const unassigneds = list_of_unassigned(locals);
  env = extend_environment(locals, unassigneds, env);

  const output = operator.evaluate(program, env);

  return { output, env }
}

const main = () => {
  const operator = create_operator();
  operator.set("constant_declaration", declaration);
  operator.set("variable_declaration", declaration);
  operator.set("assignment", assignment);
  operator.set("name", name);
  operator.set("application", application);
  operator.set("block", block);

  test_evaluator(operator, execute, make_frame);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
