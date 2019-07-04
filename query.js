import {m, css} from './deps.js'

import model from './model.js'

let resolution

export default e => {
  model.input = e.target.value
  
  clearTimeout(resolution)
  
  resolution = setTimeout(search, model.throttle)
  
  feedback()
}

function search(){
  model.query = model.input

  const [exact, partial] = [
    RegExp('\\b' + model.query + '\\b', 'i'),
    RegExp(        model.query,         'i'),
  ]
  
  model.results = (
      model.query.length === 0
    ?
      []
    :
      model.characters.filter(
          model.query.length === 1
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