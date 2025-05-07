import { error, stringify, length, pair, head, tail, map, append, list, accumulate, is_pair } from "sicp";
import { elem_at_i } from "../utils/lists.js";

export const create_extend_environment = (make_frame) => (symbols, vals, base_env) => {
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

export const make_frame = (symbols, values) => pair(symbols, values)

export const extend_environment = create_extend_environment(make_frame);

export const scan_out_declarations = (component) => {
  return getTag(component) === "sequence"
    ? accumulate(append,
      null,
      map(scan_out_declarations,
        sequence_statements(component)))
    : is_declaration(component)
      ? list(declaration_symbol(component))
      : null;
}

const is_declaration = (component) => {
  const tag = getTag(component);
  return tag === "constant_declaration" ||
    tag === "variable_declaration" ||
    tag === "function_declaration";
}

export const unassigned = "*unassigned*";
export const list_of_unassigned = (symbols) => {
  return map((symbol) => unassigned, symbols);
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

export const is_tagged_list = (component, the_tag) => is_pair(component) && head(component) === the_tag
