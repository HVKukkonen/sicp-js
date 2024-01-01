import {display, enum_stream, pair, stream_for_each, stream_ref, is_null, head, stream_tail} from 'sicp';

export const stream_map_2 = (f, s1, s2) => {
  if (is_null(s1) || is_null(s2)) {
    return null;
  }

  return pair(f(head(s1), head(s2)), () => stream_map_2(f, stream_tail(s1), stream_tail(s2)));
}


const ones = pair(1, () => ones);
const add_streams = (s1, s2) => stream_map_2((a, b) => a + b, s1, s2);
const integers = pair(1, () => add_streams(ones, integers))

const mul_streams = (s1, s2) => stream_map_2((a, b) => a * b, s1, s2);
const factorials = pair(1, () => mul_streams(factorials, integers));

(() => {
  stream_for_each((i) => display(stream_ref(factorials, i), `${i}th factorial is --`), enum_stream(0, 10))
})()
