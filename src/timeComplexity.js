/**
 * Helper function to calculate the wall time of a function run
 * @param {*} func function to time
 * @param  {...any} args any arguments to pass to function
 * @returns wall time of the function run in ms
 */
const timer = (func, ...args) => {
    const t0 = performance.now();
    func(...args);
    return performance.now() - t0;
}

/**
 * Helper function to evaluate the time complexity of a given function.
 * Runs the function with incrementing input values for n times keeping parameters fixed.
 * @param {*} func func function to evaluate
 * @param {*} x0 first-run value
 * @param {*} inc increment
 * @param {*} nRuns number of runs
 * @param  {...any} params parameters to pass for the function
 * @returns array of run times in ms
 */
export const runner = (func, x0, inc, nRuns, ...params) => [...Array(nRuns)
    .keys()]
    .map((x) => x0 + x * inc)
    .map((x) => timer(func, x, ...params))