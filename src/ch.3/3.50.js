import {enum_stream, display_list, pair, stream_tail, stream_to_list, is_null, head, list} from 'sicp';

export const stream_map_2 = (f, s1, s2) => {
  if (is_null(s1) || is_null(s2)) {
    return null;
  }

  return pair(f(head(s1), head(s2)), () => stream_map_2(f, stream_tail(s1), stream_tail(s2)));
}

const memo = (f) => {
  let has_run = false;
  let result = null;

  return () => {
    if (!has_run) {
      has_run = true;
      result = f();
    }

    return result;
  }
}

const stream_map_2_optimized = (f, s1, s2) => {
  if (is_null(s1) || is_null(s2)) {
    return null;
  }

  // as we memoize the stream iterating function further iterations over the stream will skip the application of f
  // this would be beneficial in cases where f is an expensive operation 
  return pair(f(head(s1), head(s2)), memo(() => stream_map_2_optimized(f, stream_tail(s1), stream_tail(s2))));
}

const main = () => {
  const s1 = enum_stream(1, 5)
  const s2 = enum_stream(5, 9)

  display_list(stream_to_list(stream_map_2((a, b) => a - b, s1, s1)), 'diffs between self are')
  display_list(stream_to_list(stream_map_2_optimized((a, b) => a + b, s1, s1)), 'sums between streams are')
}

main();
