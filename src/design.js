var gr8 = require('gr8')
var recsst = require('recsst')
var css = gr8({
  fontSize: [2],
  spacing: [0.5, 1, 2],
  responsive: true
})

css.add({
  prop: 'font-family',
  vals: {
    sans: '"Arial Narrow", Arial, sans-serif'
  },
  hyphenate: true
})

css.add({
  prefix: 'fsvw',
  prop: 'font-size',
  unit: 'vw',
  vals: [2, 6, 40, 54]
})

css.add({
  prefix: 'invert',
  declaration: `filter: invert(100%)`
})

css.add({
  prefix: 'bgc',
  prop: 'background-color',
  vals: {
    white: '#fff',
    black: '#000'
  },
  hyphenate: true
})

css.add({
  prefix: 'tc',
  prop: 'color',
  vals: {
    white: '#fff',
    black: '#000'
  },
  hyphenate: true
})

var custom = `
  .key {
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    background-color: #000;
    color: #fff;
    padding: 0.3em 0.5em 0.3em 0.5em;
    border-radius: 0.15em;
  }
  .pulse {
    transform: scale(1.15)
  }
`

var cssString = recsst.toString() + css.toString() + custom
process.stdout.write(cssString)
