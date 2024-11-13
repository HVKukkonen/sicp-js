import {parse, stringify, head, tail, error, list} from 'sicp';
import {assert} from '../utils/tests.js';
import {elem_at_i} from '../utils/lists.js';

const main = () => {
  for (const [expression, expectation] of [
    // ["42;", 42],
    // ["const x = 42;", 42],
    ["const x = 42; x;", 42],
  ]) {
    test_evaluate(expression, expectation);
  }
}

const test_evaluate = (expression, expectation) => {
  const tagged_list = parse(expression);
  const result = evaluate(tagged_list);
  const error_message = `Result: ${stringify(result)}, tagged list: ${stringify(
    tagged_list
  )} resulting from expression ${expression}`;
  assert(result === expectation, error_message)
  console.log(`Evaluation of ${expression} passed successfully!`);
}

export const evaluate = (component, env) => {
  const operator = new Operator();
  operator.set("literal", (value, env) => head(value));
  operator.set("name", (symbol, env) => get_symbol(symbol, env));
  operator.set("constant_declaration", (component, env) =>
    evaluate_constant_declaration(component, env)
  );
  operator.set("sequence", (statements, env) =>
    evaluate_sequence(statements, env)
  );
  operator.set("return_statement", (value, env) => evaluate(value, env));

  const value = tail(component);

  return operator.get(getTag(component))(value, env);
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

const evaluate_constant_declaration = (component, env) => {
  const symbol = elem_at_i(0, component)
  
  const value_expression = elem_at_i(1, component)
  const value = evaluate(value_expression, env)

  assign_symbol(symbol, value, env)

  return value;
}

const assign_symbol = (symbol, value, env) => {
  env = env ?? {};
  env[symbol] = value;
}

const get_symbol = (symbol, env) => {
  return env[symbol];
}

const evaluate_sequence = (statements, env) => {
  if (statements.length === 0) {
    return undefined;
  }

  statements = head(statements);
  const first_statement = head(statements);
  const first_value = evaluate(first_statement, env);
  if (is_return(first_statement) || statements.length === 1) {
    return first_value;
  }

  return evaluate_sequence(list(tail(statements)), env);
};

const is_return = (statement) => getTag(statement) === "return_statement";

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
