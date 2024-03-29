import m from 'mithril'
import css from 'bss'

import model from './model.js'

let resolution

export default e => {
  model.input = e.target.value

  clearTimeout(resolution)

  resolution = setTimeout(search, model.throttle)

  feedback()
}

function search(){
  const query = model.query = model.input

  const [exact, partial] = [
    RegExp('\\b' + query + '\\b', 'i'),
    RegExp(        query,         'i'),
  ]

  model.results = (
      query.length === 0
    ?
      []
    :
      model.characters.filter(
          query.length === 1
        ?
          ({na1}) =>   exact.test(na1)
        :
          ({na1}) => partial.test(na1)
      )
  )

  m.redraw()
}

const visible = css`
  height: .5em;
  opacity: 1;
`

const moving  = css.$animate(`${ model.throttle }ms ease-in-out 1 forwards`, {
  from : 'width:   0%',
  to   : 'width: 100%',
})

function feedback(){
  const {progress} = model

  // Stop animation
  progress.classList.remove(moving)

  // Force reflow
  void progress.offsetWidth

  // Start animation
  progress.classList.add(visible, moving)

  void ['animationend', 'animationcancel'].forEach(event => {
    progress.addEventListener(event, () => {
      progress.classList.remove(visible)
    })
  }, {once: true})
}
