// The exercise extends the evaluator from 4.3.
// Some environment operations are refactored to use a shared abstraction.
// This requires rewrite for some dependent operations as well.
// Tests from 4.3 are reused to verify the correctness of the new implementation.
import { is_null, tail, head, set_head, error, list_ref} from "sicp";
import { create_operator, test_evaluator, assignment_symbol } from "./4.3.js";
import { declaration_symbol, symbol_of_name } from "./eval_utils.js";

const create_env_operator = (symbol, operate) => {
  const env_loop = (env) => {
    const scan = (symbols, vals) => {
      if (is_null(symbols)) {
        return env_loop(tail(env));
      }

      if (symbol === head(symbols)) {
        return operate(vals);
      }

      return scan(tail(symbols), tail(vals));
    }

    if (is_null(env)) {
      return error(symbol, "unbound name");
    }

    const frame = head(env);
    return scan(head(frame), tail(frame));
  }

  return env_loop;
}

const lookup_symbol_value = (symbol, env) => create_env_operator(
  symbol,
  (vals) => head(vals)
)(env);

const assign_symbol_value = (symbol, val, env) => create_env_operator(
  symbol,
  (vals) => set_head(vals, val)
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

const main = () => {
  const operator = create_operator();
  operator.set("constant_declaration", declaration);
  operator.set("variable_declaration", declaration);
  operator.set("assignment", assignment);
  operator.set("name", name);

  test_evaluator(operator);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
