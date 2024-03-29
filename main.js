import m from 'mithril'
import css from 'bss'

import model from './model.js'

import Character from './Character.js'
import Differ from './Differ.js'

import query from './query.js'

window.model = model

model.loading = true

fetch('./UnicodeData.txt')
  .then(response => response.text())
  .then(text => {
    model.characters = text.split('\n')
      .map(entry => entry.split(';'))
      .map(([cp, na1]) => ({cp, na1, string: String.fromCharCode(
        parseInt(cp, 16)
      )}))

    model.loading = false
  })

m.mount(document.body, {
  view: v =>
    m('#App', [
      m('.progress' + css`
        background: blue;
        position  : fixed;
        opacity   : 0;
        height    : 0;
        left      : 0;
        top       : 0;
        transition: .4s ease-in-out;
      `, {
        oncreate({dom}){
          model.progress = dom
        },
      }),

      m('header' + css`
        display        : flex;
        justify-content: space-between;
        margin         : -.75em -.75em 0 0;
      `,
        m('h1' + css`
          padding: .5em .5em 0 0;
        `,
          'Charsearch'
        ),

        [
          ['🔍', '#query',  'Search by description'],
          ['🙃', '#glyph',  'Search by character'],
          ['📚', '#saved',  'Saved characters'],
          ['🔧', '#config', 'Configuration'],
          ['❓', '#about',  'About'],
        ].map(([textContent, href, title]) =>
          m('a' + css`
            text-align     : center;
            text-decoration: none;
            padding        : .5em;
          `, {
            title,
            href,
            textContent,
          }),
        ),
      ),

      m('br'),

      m('main' + css`
      `,
        m('input#search[autofocus][type=search]' + css`
          font      : inherit;
          text-align: center;
          width     : 100%;
          padding   : .5em;
          box-sizing: border-box;
        `, {
          placeholder: `Describe a character`,
          oninput    : query,
          value      : model.input,
        }),

        m('br'),
        m('br'),

          model.results.length === 0
        ?
          model.query.length
        ?
          `No results matching "${ model.query }"`
        :
          `Enter a search string to see results!`
        : [
            `${ model.results.length } results:`,

            m('br'),
            m('br'),

            m('#Characters' + css`
              display: flex;
              flex-wrap: wrap;
              border: solid;
              border-width: 1px 0 0 1px;
            `,
              [model.selection &&
                m('#Selection' + css`
                  border-top: 1px solid;
                  background: white;
                  transition: color .3s ease-in-out;
                  position  : fixed;
                  padding   : 1em 2em 1em;
                  z-index   : 1;
                  height    : 1em;
                  bottom    : 0;
                  right     : 0;
                  left      : 0;
                  cursor    : pointer;
                ` + css`
                  color     : ${model.selection === model.copied ? 'blue' : 'inherit'};
                `,

                  model.selection.string + ' ' + model.selection.cp + ' ' + model.selection.na1
                )
              ],

              [model.results.map((character, i) =>
                m(Character, {character})
              )],
            ),
          ],
      ),
    ]),
})

function search(){
  const {query} = model

  if(!query.length)
    return

  else if(query.length === 1)
    model.results = model.characters.filter(({na1}) =>
      na1 && na1.toLowerCase().split(' ').find(string => string === query)
    )

  else
    model.results = model.characters.filter(({na1}) =>
      na1 && na1.toLowerCase().includes(query)
    )
}

function debounce(func, delay = 150){
  let timeout, context, args, timestamp, result

  const later = () => {
    const last = Date.now() - timestamp

    if (last < delay && last >= 0)
      timeout = setTimeout(func, delay - last)

    else
      timeout = null
  }

  return Object.assign(
    function debounced(){
      context   = this
      args      = arguments
      timestamp = Date.now()

      if (!timeout)
        timeout = setTimeout(later, delay)

      return result
    }, {
      clear(){
        if (!timeout) return

        clearTimeout(timeout)

        timeout = null
      },

      flush(){
        if (!timeout) return

        result  = func.apply(context, args)
        context = args = null

        clearTimeout(timeout)

        timeout = null
      }
    }
  )
}
