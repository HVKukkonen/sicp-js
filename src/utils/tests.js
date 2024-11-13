import {error} from 'sicp';

export const assert = (condition, message) => {
  if (!condition) {
    return error(message);
  }
}