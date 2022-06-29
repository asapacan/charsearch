import m from 'mithril'
import css from 'bss'
import model from './model.js'

const select = (character, active) => async ({target}) => {
  const selection = getSelection()

  if(selection.rangeCount > 0)
    selection.removeAllRanges()

  const range = document.createRange()

  range.selectNode(target)

  selection.addRange(range)

  model.selection = character

  if(!active) return

  await navigator.clipboard.writeText(character.string)

  model.copied = character
}

export default {
  view: ({attrs: {character}}) =>
    m('a.Character' + css`
      position    : relative;
      height      : 3em;
      width       : 3em;
      flex-grow   : 1;
      border      : solid;
      border-width: 0 1px 1px 0;
      cursor      : pointer;
    ` + css`
      color       : ${ character === model.copied ? 'blue' : 'inherit'};
    `, {
      title       : character.na1 + '\n\n' + character.cp,
      tabIndex    : '0',
      onclick     : select(character, true),
      onfocus     : select(character, true),
      onmouseover : select(character),
    },
      m('span.Glyph' + css`
        position : absolute;
        font-size: 2em;
        left     : 50%;
        top      : 50%;
        transform: translate(-50%, -50%);
      `,
        character.string,
      )
    ),
}
