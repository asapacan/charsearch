import {m, css} from './deps.js'

import Refresher from './Refresher.js'
import Character from './Character.js'
import Collapser from './Collapser.js'

const model = window.model = {
    characters: [],
    selection: new Set,
    results: [],
    loading: false,
    groups: [],
    query: '',
    xml: undefined,
  }

const search = () => {
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

const parse = ({target: {result}}) => {
  model.loading = true

  model.xml = (new DOMParser).parseFromString(
    result, 'application/xml',
  )

  if(model.xml.querySelector('parsererror'))
    return
  
  model.groups = 
    Array.from(
      model.xml.querySelectorAll('group')
    ).map(block => 
      block.getAttribute('blk')
    )
  
  model.loading = false
}

const ingest = ({target: {files: [source]}}) => 
  new Promise((yes, no) => {
    Object.assign(new FileReader(), {
      onload : yes,
      onerror : no,
    })
      .readAsText(source)
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
          m('p', m('a[href=#source]', 'Configure'), ' the application by selecting a ', m('em', 'grouped'), ' ', m('abbr[title="Unicode Character Database"]', 'UCD'), ' XML file (', m('a[href=https://www.unicode.org/ucd/#UCDinXML]', 'available from the Unicode website'), '), then checking the sets you wish to search in.'),

          m('p', 'Then start typing in the ', m('a[href=#search]', 'search input'), ' to filter results.'),

          m('p', 'For example, if I load ', m('a[href=https://www.unicode.org/Public/12.0.0/ucdxml/ucd.nounihan.grouped.zip]', 'ucd.nouhinan.grouped.xml'), ', I can then select Latin_1_Sup, Latin_1_Sup, Latin_Ext_A, Latin_Ext_B groups. When I search for \'acute\', I should see the following characters: ĆćĹĺŃńŐőŔŕŚśŰűŹźǗǘ´ÁÉÍÓÚÝáéíóúý. By using tab navigation I can then select the desired character and hit ', m('kbd', 'Ctrl'), ' + ', m('kbd', 'C'), ' to copy it to the clipboard.'),

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

      m(Collapser, ({toggle, indicator, contents}) => [
        toggle(
          m('h2', indicator(), 'Config'),
        ),

        contents(
          m(Refresher, refresh => [
            m('input#source[type=file]', {
              onchange: async e => {
                try {
                  parse(await ingest(e))
                }
                catch {
                  alert([
                    `Couldn't read the input.`,
                    `Did you supply a UCD XML file?`,
                    `Canonical source:`,
                    `https://www.unicode.org/ucd/`,
                  ])
                }
                finally {
                  m.redraw()
                }
              },
            }),

            m('hr'),

            [model.loading && 'Loading...'],

            [model.groups && model.groups.map((label, index) =>
              m('label[style=display:block]',
                m('input[type=checkbox]', {
                  onclick: ({target: {checked}}) => {
                    model.query = ''

                    model.results = []

                    model.selection[
                      checked ? 'add' : 'delete'
                    ](index)

                    model.characters = Array.from(model.selection).reduce(
                      (characters, index) => (
                        characters.push(
                          ...Array.from(
                            model.xml.querySelectorAll('group')[index].children
                          ).map(char => ({
                            cp: char.getAttribute('cp'),
                            na1: char.getAttribute('na1'),
                          }))
                        ),

                        characters
                      ),
                      [],
                    )
                  },
                }),

                label,
              )
            )]
          ]),
        )
      ]),
    ]),
})
