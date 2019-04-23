import {m, css} from './deps.js'

export default {
  view: ({attrs: {character}}) =>
    m('.Character' + css`
      position: relative;
      display: inline-block;
      height: 3em;
      width: 3em;
      border: 1px solid;
      margin: -1px 0 0 -1px;
    `, {
      title: character.na1 + '\n\n' + character.cp,
      tabIndex: '0',
      onfocus: ({target}) => {
        const selection = getSelection()
        
        if(selection.rangeCount > 0)
          selection.removeAllRanges()
        
        const range = document.createRange()

        range.selectNode(target)

        selection.addRange(range)
      },
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
    )
}