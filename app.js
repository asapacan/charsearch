import {m, css} from './deps.js'

import Character from './Character.js'
import Collapser from './Collapser.js'

const model = window.model = {
  characters: [],
  results: [],
  loading: true,
  groups: [],
  query: '',
}

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
    m('#App' + css`
      margin: 1em;
    `, [
      m('h1', 'Charsearch'),
        
      m('p', 'A unicode character search application'),

      m(Collapser, ({toggle, indicator, contents}) => [
        toggle(
          m('h2', indicator(), 'Instructions'),
        ),
        
        contents([
          m('p', 'Charsearch uses provided search query to match against the descriptions of characters in the latest Unicode Character Database (excluding UniHan). By using tab navigation you can then select the desired character and hit ', m('kbd', 'Ctrl'), ' + ', m('kbd', 'C'), ' to copy it to the clipboard.'),

          m('p', 'This application was developed by ', m('a[href=https://github.com/barneycarroll]', 'Barney Carroll'), '. The font is ', m('a[href=http://unifoundry.com/unifont/index.html]', 'GNU Unifont'), ', kindly converted to WOFF format by ', m('a[href=https://shkspr.mobi/blog/2019/04/banish-the-%EF%BF%BD-with-unifont/]', ' Terence Eden'), '.'),
        ]),
      ]),

      m(Collapser, ({toggle, indicator, contents}) => [
        toggle(
          m('h2', indicator(), 'Search'),
        ),

        contents([
          m('input#search', {
            value: model.query,
            oninput: ({target: {value}}) => {
              model.query = value.toLowerCase()

              search()
            },
          }),

          m('hr'),

            model.results.length === 0
          ? 
            model.query.length
          ?
            `No results matching "${ model.query }"`
          :
            `Start typing to see results`
          : [
            `Query "${ model.query }" yielded ${ model.results.length } results:`,

            m('br'),

            m('#Characters' + css`
              margin: 1em;
            `,
              model.results.map(character => 
                m(Character, {character})
              ),
            ),
          ]
        ]),
      ]),
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