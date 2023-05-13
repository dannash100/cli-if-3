import { generateMapString, generateMapString2, mapTemplate } from './map'
import * as Table from 'cli-table3'
import * as Chalk from 'chalk'

const T = Table as unknown as Table
// const C = Chalk as unknown as Chalk.ChalkInstance

console.log('The console size is:', process.stdout.getWindowSize())

console.log(
  'Terminal size: ' + process.stdout.columns + 'x' + process.stdout.rows,
  process.stdout.rows / 0.7
)
const table = new T({
  colWidths: [80, 27],
  rowHeights: [1, 18, 4],
  head: [Chalk.whiteBright.bold('Tavern'), Chalk.whiteBright.bold('Map')],
  wordWrap: true,

  chars: {
    top: '═',
    'top-mid': '╤',
    'top-left': '╔',
    'top-right': '╗',
    bottom: '═',
    'bottom-mid': '╧',
    'bottom-left': '╚',
    'bottom-right': '╝',
    left: '║',
    'left-mid': '╟',
    mid: '─',
    'mid-mid': '┼',
    right: '║',
    'right-mid': '╢',
    middle: '│',
  },
})

table.push(
  [
    "You're in a dark and smoky tavern, filled to capacity with soldiers, louts, and other misfits like yourself. The ringing of glasses is almost drowned out by the din of drunken voices. An exit lies to the east. Sitting at a nearby table is a grizzled warrior.",
    { content: generateMapString2(mapTemplate) },
    { content: `` },
  ],
  [{ content: '> what do you do?', colSpan: 2 }]
)

console.log(table.toString())
