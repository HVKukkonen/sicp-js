import {display} from 'sicp';

const make_accumulator = (value) => (increment) => {
  value = value + increment
  return value
}

const main = () => {
  const a = make_accumulator(5)

  display(a(10), 'add 10 to the original 5 get')
  display(a(5), 'add another 5 get')
}

main()
