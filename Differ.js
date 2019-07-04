import {m} from './deps.js'

import {viewOf} from './utils.js'

export default {
  view: (v, {attrs: {value}, state} = v) => (
    viewOf(v)(value, model.previous),
    model.previous = value
  ),
}