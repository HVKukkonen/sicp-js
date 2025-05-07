import { head, length, tail, pair, error, math_abs, math_PI, math_E, parse, is_null, display, append, stringify, map, accumulate, list_ref, is_pair, list } from "sicp";
import { extend_environment, scan_out_declarations, list_of_unassigned, is_tagged_list, create_extend_environment } from "./eval_utils.js";
import { assert } from "../utils/tests.js";

export const create_driver = (user_input, operator, expectation, execute) => {
  const input_generator = make_input_generator(append(user_input, list(null)));

  const driver_loop = (env, accumulative_output) => {
    const input = user_read(input_generator);
    if (is_null(input)) {
      display("Evaluator terminated");
      verify(accumulative_output, expectation);
      display("Output passed verification!");
      return accumulative_output;
    }

    const { output, env: new_env } = execute(input, env, operator);
    user_print(output_prompt, output);
    
    return driver_loop(new_env, append(accumulative_output, list(output)));
  }
  
  return driver_loop;
}
  
export const execute = (input, env, operator) => {
  const program = parse(input);
  const locals = scan_out_declarations(program);
  const unassigneds = list_of_unassigned(locals);
  env = extend_environment(locals, unassigneds, env);
  
  const output = operator.evaluate(program, env);

  return { output, env }
}

const verify = (result, expectation) => {
  assert(length(result) === length(expectation), `Expected length ${length(expectation)}, got ${length(result)}`);

  for (let i = 0; i < length(expectation); i++) {
      const result_item = list_ref(result, i);
      const expected_item = list_ref(expectation, i);
      const item_error_message = `Expected: ${stringify(expected_item)}, Got: ${stringify(result_item)}. Full result: ${stringify(result)}`;
      assert(result_item === expected_item, item_error_message);
  }
}

const output_prompt = "\nM-evaluate value:\n";
const input_prompt = "\nM-evaluate input:\n";

export const setup_environment = (make_frame) => create_extend_environment(make_frame)(
  append(primitive_function_symbols, primitive_constant_symbols),
  append(primitive_function_objects, primitive_constant_values),
  null
)

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
  return is_tagged_list(component, "compound_function")
         ? "<compound-function>"
         : is_tagged_list(component, "primitive")
         ? "<primitive-function>"
         : is_pair(component)
         ? "[" + to_string(head(component)) + ", "
               + to_string(tail(component)) + "]"
         : stringify(component);
}