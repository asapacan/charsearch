import {m} from './deps.js'

import viewOf from './viewOf.js'

export default () => {
  let timestamp

  const refresh = () => {
    timestamp = Date.now()
  }

  return {
    view: v => [
      m.fragment({
        key: timestamp,
      }, [
        viewOf(v)(refresh),
      ]),
    ],
  }
}