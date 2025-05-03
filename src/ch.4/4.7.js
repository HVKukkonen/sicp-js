// The exercise starts with a simpler while loop implementation; while_by_function.
// Then the implementation called direct_while is introduced.
// It adds support for break and continue statements.
// There's tests showcasing the intended behaviour.
import { display, is_pair, list, list_ref } from "sicp";
import { assert } from "../utils/tests.js";
import { create_operator, is_return_value, make_return_value } from "./4.3.js";
import { create_driver, setup_environment } from "./driver_loop.js";
import { unparse } from "./4.2.js";
import { getTag } from "./eval_utils.js";

// reference implementation
const reference_factorial = (n) => {
  let product = 1;
  let counter = 1;

  const iter = () => {
    if (counter > n) {
      return product;
    }

    product = product * counter;
    counter = counter + 1;
    return iter();
  }

  return iter();
}

const factorial = (n) => {
  let product = 1;
  let counter = 1;

  while_loop(
    () => counter <= n,
    () => {
      product = product * counter;
      counter = counter + 1;
    }
  );

  return product;
}

const while_loop = (predicate, block) => {
  if (predicate()) {
    block();
    while_loop(predicate, block);
  }
};

const while_by_function = (evaluate) => (component, env) => {
  const predicate = () => evaluate(list_ref(component, 1), env);
  const block = () => evaluate(list_ref(component, 2), env);
  return while_loop(predicate, block);
};

const is_break = (value) => {
  return is_pair(value) && getTag(value) === "break";
}

const is_continue = (value) => {
  return is_pair(value) && getTag(value) === "continue";
}

export const direct_while = (evaluate) => (component, env) => {
  const predicate = evaluate(list_ref(component, 1), env);

  if (predicate) {
    const block = evaluate(list_ref(component, 2), env);

    if (is_return_value(block)) {
      const return_value = list_ref(block, 1);

      if (is_continue(return_value)) {
        return evaluate(component, env);
      }

      if (!is_break(return_value)) {
        return block;
      }
    } else {
      return evaluate(component, env);
    }
  }
}

const implement_tag = (tag) => (evaluate) => (component, env) => make_return_value(list(tag));
export const break_implementation = implement_tag('break');
export const continue_implementation = implement_tag('continue');



const add_implementations = (implementations) => {
  const operator = create_operator();

  for (const [tag, implementation] of implementations) {
    operator.set(tag, implementation);
  }

  return operator;
}

const factorial_test = (program, operator) => {
  const driver = create_driver(list(program, 'factorial(3);'), operator, list(undefined, reference_factorial(3)));
  driver(setup_environment(), list());
}

const main = () => {
  // 1. test the while_loop function -----------------------------------
  const test_set = [0, 1, 3];

  for (const n of test_set) {
    const value = factorial(n);
    assert(value === reference_factorial(n), `factorial(${n}): ${value} does not match reference implementation`);
  }

  display("while_loop passed validation!");
  display("Let's next test the while_loop based program.");

  // 2. test the while_loop based program ------------------------------

  const while_factorial = `
    const factorial = (n) => {
      let product = 1;
      let counter = 1;

      while (counter <= n) {
        product = product * counter;
        counter = counter + 1;
      }

      return product;
    };
  `

  const crude_operator = add_implementations([
    ['while_loop', while_by_function],
  ]);

  factorial_test(while_factorial, crude_operator);

  // 3. test the advanced implementation against the return
  // and break flavours of the factorial program
  display("Let's next test two factorial program variations.");

  const create_factorial = (block_action, return_value) => `
    const factorial = (n) => {
      let product = 1;
      let counter = 1;

      while (true) {
        product = product * counter;
        counter = counter + 1;
        if (counter > n) {
          ${block_action};
        }
      }

      return ${return_value};
    };
  `

  const return_factorial = create_factorial(
    'return product',
    '0',
  );

  const break_factorial = create_factorial(
    'break',
    'product',
  );

  const advanced_operator = add_implementations([
    ['while_loop', direct_while],
    ['break_statement', break_implementation],
    ['continue_statement', continue_implementation],
  ]);
  
  for (const program of [return_factorial, break_factorial]) {
    factorial_test(program, advanced_operator);
  }

  // 4. test the advanced implementation against the half_counter program
  display("Let's test the half_counter program last.");
  
  const half_counter = `
    const half_counter = (n_to_half) => {
      let counter = 0;
      let value = 0;

      while (counter < n_to_half) {
        counter = counter + 1;
        if (counter % 2 === 0) {
          continue;
        }

        value = value + 1;
      }

      return value;
    };
  `
  
  const driver = create_driver(list(half_counter, 'half_counter(4);'), advanced_operator, list(undefined, 2));
  driver(setup_environment(), list());

  display('All tests passed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
