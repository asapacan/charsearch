import {m, css} from './deps.js'
import model from './model.js'

const select = character => ({target}) => {
  const selection = getSelection()
        
  if(selection.rangeCount > 0)
    selection.removeAllRanges()
  
  const range = document.createRange()

  range.selectNode(target)

  selection.addRange(range)

  model.selection = character
}

export default {
  view: ({attrs: {character}}) => 
    m('.Character' + css`
      position: relative;
      height: 3em;
      width: 3em;
      flex-grow: 1;
      border: solid;
      border-width: 0 1px 1px 0; 
    `, {
      title: character.na1 + '\n\n' + character.cp,
      tabIndex: '0',
      onclick:      select(character),
      onfocus:      select(character),
      onmouseenter: select(character),
    },
      m('span.Glyph' + css`
        position: absolute;
        font-size: 2em;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      `,
        String.fromCharCode(
          parseInt(character.cp, 16)
        ) 
      )
    ),
}