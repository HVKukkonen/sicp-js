import {append, display, head, tail, list, set_head, is_null} from 'sicp';

const acquire_lit = 'acquire';
const release_lit = 'release';

const test_and_set = (cell) => {
  if (head(cell)) {
    return true;
  } else {
    set_head(cell, true);
    return false;
  }
}

const clear = (cell) => {
  return set_head(cell, false);
};

const make_mutex = () => {
  const cell = list(false);

  const the_mutex = (m) =>
    m === acquire_lit
      ? test_and_set(cell)
        ? the_mutex(acquire_lit)
        : true
      : m === release_lit
      ? clear(cell)
      : error(m, "unknown request -- mutex");

  return the_mutex;
}

// a. (b. can be solved in a similar fashion)
const make_semaphore_mutex = (n) => {
  let taken = list();

  const the_semaphore = (operation) => {
    if (operation === acquire_lit) {
      if (n > 0) {
        const mutex = make_mutex()
        const result = mutex(operation);
        taken = append(taken, list(mutex))
        n = n - 1;
        return result;
      } else {
        return head(taken)(operation)
      }
    } else if (operation === release_lit) {
      if (is_null(taken)) {
        return make_mutex()(operation)
      }
      const mutex = head(taken);
      taken = tail(taken);
      n = n + 1;
      return mutex(operation);
    }
  }

  return the_semaphore;
}

const main = () => {
  const semaphore = make_semaphore_mutex(2);

  display(semaphore(acquire_lit), 'acquiring semaphore')
  display(semaphore(acquire_lit), 'acquiring semaphore')
  display(semaphore(release_lit), 'releasing semaphore')
  display(semaphore(acquire_lit), 'acquiring semaphore')
}

main();
