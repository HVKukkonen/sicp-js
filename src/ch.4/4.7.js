import { display, is_pair, list, list_ref } from "sicp";
import { assert } from "../utils/tests.js";
import { create_operator, is_return_value } from "./4.3.js";
import { create_driver, setup_environment } from "./driver_loop.js";
import { unparse } from "./4.2.js";

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

const program_test = (program, implementation) => {
  const operator = create_operator();
  operator.set("while_loop", implementation);

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

  display("while_loop passed validation!\nLet's next test the while_loop based program.");

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

  const implementation_by_function = (evaluate) => (component, env) => {
    const predicate = () => evaluate(list_ref(component, 1), env);
    const block = () => evaluate(list_ref(component, 2), env);
    return while_loop(predicate, block);
  };

  // program_test(while_factorial, implementation_by_function);

  // 3. test the return_factorial program -----------------------------
  display("Let's next test the return_factorial program.");

  const return_factorial = `
    const factorial = (n) => {
      let product = 1;
      let counter = 1;

      while (true) {
        product = product * counter;
        counter = counter + 1;
        if (counter > n) {
          return product;
        }
      }

      return 0;
    };
  `

  const direct_implementation = (evaluate) => (component, env) => {
    const predicate = evaluate(list_ref(component, 1), env);

    if (predicate) {
      const block = evaluate(list_ref(component, 2), env);

      if (is_return_value(block)) {
        return block;
      }

      return evaluate(component, env);
    }
  }

  program_test(return_factorial, direct_implementation);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
