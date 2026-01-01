import { error, is_boolean } from 'sicp';

export const assert = (condition, message) => {
  if (!condition) {
    return error(message);
  }
}

export const is_truthy = (x) => {
  if (!is_boolean(x)) {
    return error(x, "boolean expected, received");
  }

  return x;
}