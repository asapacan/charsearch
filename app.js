import {m, css} from './deps.js'

import model from './model.js'

import Character from './Character.js'

import query from './query.js'

window.model = model

fetch('./UnicodeData.txt')
  .then(response => response.text())
  .then(text => {
    model.characters = text.split('\n')
      .map(entry => entry.split(';'))
      .map(([cp, na1]) => ({cp, na1}))

    model.loading = false
  })

m.mount(document.body, {
  view: v => 
    m('#App', [
      m('.progress' + css`
        background: blue;
        position: fixed;
        opacity: 0;
        height: 0;
        left: 0;
        top: 0;
        transition: .3s ease-in-out;
      `, {
        oncreate: ({dom}) => {
          model.progress = dom
        },
      }),

      m('header' + css`
        display: flex;
        justify-content: space-between;
        margin: -1em -1em 0 0;
      `,
        m('h1' + css`padding: 1em 1em 0 0`, 'Charsearch'),

        [
          ['🔍', '#query', 'Search by description'],
          ['🙃', '#glyph', 'Search by character'],
          ['📚', '#saved', 'Saved characters'],
          ['⚙', '#config', 'Configuration'],
          ['❓', '#about', 'About'],
        ].map(([textContent, href, title]) => 
          m('a' + css`
            text-align: center;
            text-decoration: none;
            padding: 1em;
          `, {
            title,
            href, 
            textContent, 
          }),
        ),
      ),

      m('main' + css`
      `,
        m('input#search[autofocus][type=search]' + css`
          font: inherit;
          text-align: center;
          width: 100%;
          padding: .5em;
          box-sizing: border-box;
        `, {
          placeholder: `Describe the character you're searching for`,
          oninput: query,
          value: model.input,
        }),

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

            m('#Characters' + css`
              display: flex;
              flex-wrap: wrap;
              border: solid;
              border-width: 1px 0 0 1px;
            `,
              [model.selection && m('#Selection' + css`
                border-top: 1px solid;
                background: white;
                position: fixed;
                padding: 1em 2em 1em;
                z-index: 1;
                height: 1em;
                bottom: 0;
                right: 0;
                left: 0;
              `,
              String.fromCharCode(
                parseInt(model.selection.cp, 16)
              ) + ' ' + model.selection.cp + ' ' + model.selection.na1
              )],

              [model.results.map((character, i) => 
                m(Character, {character, key: i + character})
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

function parse(source){
  const xml = (new DOMParser).parseFromString(
    source, 'application/xml',
  )

  if(xml.querySelector('parsererror'))
    alert('Parser error: the XML appears to be malformed.')
  
  else
    return xml
}

function debounce(wait = 100, func){
  let timeout, args, context, timestamp, result

  const later = () => {
    const last = Date.now() - timestamp;

    if (last < wait && last >= 0)
      timeout = setTimeout(later, wait - last)
    
    else
      timeout = null
  }

  return Object.assign(
    function(){
      context   = this
      args      = arguments
      timestamp = Date.now()

      if (!timeout)
        timeout = setTimeout(later, wait)
  
      return result
    }, {
      clear : () => {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
      },
      
      flush : () => {
        if (timeout) {
          result  = func.apply(context, args)
          context = args = null
          
          clearTimeout(timeout)
          timeout = null
        }
      }
    }
  )
}