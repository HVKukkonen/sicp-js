import { error, stringify, length, pair, head, tail } from "sicp";
import { elem_at_i } from "../utils/lists.js";

export function extend_environment(symbols, vals, base_env) {
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

export const getTag = (component) => elem_at_i(0, component);

export const sequence_statements = (stmt) => {
  return head(tail(stmt));
};

export const declaration_symbol = (component) => {
  const symbol_expression = elem_at_i(1, component);

  if (getTag(symbol_expression) !== "name") {
    return error(`Expected a name, but got ${stringify(declaration)}`);
  }

  return symbol_of_name(symbol_expression);
};

export const symbol_of_name = (component) => elem_at_i(1, component);
