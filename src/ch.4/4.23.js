import { display } from "sicp";

/**
 * The exercise asks if the provided factorial function based on unless
 * works in an applicative-order language like JavaScript. As can be seen
 * from the error "Maximum call stack size exceeded" the implementation
 * is not suitable for an applicative-order language. This is because
 * the exceptional value is evaluated before the usual value is returned
 * even when the condition is true (n === 1). This means that the factorial
 * function will recurse indefinitely.
 */

function unless(condition, usual_value, exceptional_value) {
  return condition ? exceptional_value : usual_value;
}

function factorial(n) {
  return unless(n === 1,
    n * factorial(n - 1),
    1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  display(factorial(5));
}
