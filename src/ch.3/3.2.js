import {display, error, is_function} from 'sicp';

const make_monitored = (f) => {
  if (!is_function(f)) {
    return error("Argument not a function");
  }

  let called = 0;

  const call_number = () => called;

  const reset = () => (called = 0) || 'count reseted';

  const increment = () => called = called + 1;

  return (x) => {  
    if (x === "how many calls") {
      return call_number();
    }
    if (x === "reset count") {
      return reset();
    }
    
    increment();
    return f(x);
  };
};

const main = () => {
  const fm = make_monitored((x) => x);

  display(fm(10), "call function, get - ")
  display(fm("how many calls"), "how many calls? -")
  display(fm("reset count"), "reset count -")
  display(fm("how many calls"), "how many calls? -")
}

main()
