import {viewOf} from './utils.js'

export default {
  view: v => (
    viewOf(v)(v.attrs.value, model.previous),
    model.previous = v.attrs.value
  ),
}
