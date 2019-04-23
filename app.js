import {m, css} from './deps.js'

import Refresher from './Refresher.js'
import Character from './Character.js'
import Collapser from './Collapser.js'

void (async () => {
  const model = window.model = {
    characters: [],
    selection: new Set,
    results: [],
    loading: true,
    groups: [],
    query: '',
  }

  await parse(await (await fetch('./ucd.nounihan.grouped.xml')).text())

  model.loading = false

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
            m('p', m('a[href=#source]', 'Configure'), ' the application by selecting the desired groups to search in, then start typing in the ', m('a[href=#search]', 'search input'), ' to filter results.'),

            m('p', 'For example, if I select Latin_1_Sup, Latin_1_Sup, Latin_Ext_A, Latin_Ext_B groups, then I search for \'acute\', I should see the following characters: ĆćĹĺŃńŐőŔŕŚśŰűŹźǗǘ´ÁÉÍÓÚÝáéíóúý. By using tab navigation I can then select the desired character and hit ', m('kbd', 'Ctrl'), ' + ', m('kbd', 'C'), ' to copy it to the clipboard.'),

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

          contents([
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
        ]),
      ]),
  })
})()

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

function parse(xml){
  model.loading = true

  model.xml = (new DOMParser).parseFromString(
    xml, 'application/xml',
  )

  if(model.xml.querySelector('parsererror'))
    alert('Parser error: the XML appears to be malformed.')
  
  model.groups = 
    Array.from(
      model.xml.querySelectorAll('group')
    ).map(block => 
      block.getAttribute('blk')
    )
  
  model.loading = false
}

function ingest(file){
  return new Promise((yes, no) => {
    Object.assign(new FileReader(), {
      onload : yes,
      onerror : no,
    })
      .readAsText(file)
  })
}
