// The evaluator already expresses the behavior sought in this exercise.
import { list } from "sicp";
import { execute, create_driver, setup_environment } from "./driver_loop.js";
import { make_frame } from "./eval_utils.js";
import { test_evaluator, create_operator } from "./4.3.js";

const main = () => {
  const operator = create_operator();
  test_evaluator(operator, execute, make_frame);

  const input = list("x = 10; let x;");
  const driver = create_driver(input, operator, list(), execute);
  driver(setup_environment(make_frame), list());
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}