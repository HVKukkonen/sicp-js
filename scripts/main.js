// import on the top level of html only, i.e., index head
import { runner } from "../src/timeComplexity.js";
import { times } from "../src/ch.1/1.17.js";

const prepPlot = (arr) => [{
    x: Array(arr.length).keys(),
    y: arr,
    mode: 'markers',
    type: 'scatter'
}];

const layout = {  
    // yaxis: {range: [10**-20, 10**-9]}
  };

const data = runner(times, 1, 10**9, 10, 2)

const plotElem = document.getElementById('plot');

Plotly.newPlot(plotElem, prepPlot(data), layout)
