import { error, stringify, length, pair, head, tail, map, append, list, accumulate, is_pair, is_null, set_head, list_ref, apply_in_underlying_javascript } from "sicp";
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

export const list_of_values = (evaluate) => (expressions, env) => {
  return map((arg) => evaluate(arg, env), expressions);
};

export const the_empty_environment = null;

const frame_symbols = (frame) => head(frame);

const frame_values = (frame) => tail(frame);

export const assign_symbol_value = (symbol, val, env) => {
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

export const lookup_symbol_value = (symbol, env) => {
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

export const assignment_symbol = (component) => list_ref(list_ref(component, 1), 1);

export const get_lambda_symbols = (component) => map(symbol_of_name, list_ref(component, 1));

export const make_function = (parameters, body, env) => list("compound_function", parameters, body, env);

export const create_apply = (f, check_return) => (fn, args) => {
  if (getTag(fn) === "primitive") {
    const primitive_implementation = list_ref(fn, 1);
    return apply_in_underlying_javascript(primitive_implementation, args);
  }

  if (getTag(fn) === "compound_function") {
    const params = list_ref(fn, 1);
    const env = list_ref(fn, 3);
    const new_env = extend_environment(params, args, env);

    const body = list_ref(fn, 2);
    const result = f(body, new_env);

    if (check_return(result)) {
      return list_ref(result, 1);
    }

    return undefined;
  }

  return error(fn, "Unknown function type -- apply");
};

export const is_return = (statement) => is_tagged_list(statement, "return_statement") || is_tagged_list(statement, "return_value");

export const function_decl_to_constant_decl = (component) => {
  const declaration_name = list_ref(component, 1);
  const parameters = list_ref(component, 2);
  const body = list_ref(component, 3);

  return list(
    "constant_declaration",
    declaration_name,
    list("lambda_expression", parameters, body)
  );
}

export const unary_operator_combination_to_application = (component) => {
  const operator = list_ref(component, 1);

  const first_operand = list_ref(component, 2);
  return list("application", list("name", operator), list(first_operand));
}

export const binary_operator_combination_to_application = (component) => {
  const operator = list_ref(component, 1);

  const first_operand = list_ref(component, 2);
  const second_operand = list_ref(component, 3);
  return list("application", list("name", operator), list(first_operand, second_operand));
}
