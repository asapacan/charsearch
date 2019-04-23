import {m, css} from './deps.js'

import viewOf from './viewOf.js'

export default ({attrs: {collapsed}, container, animating}) => ({
  oncreate: async () => {
    await new Promise(requestAnimationFrame)

    m.redraw()
  },
  view: v =>
    m('.Collapser', 
      viewOf(v)({
        toggle: children => 
          m('.Toggle[tabIndex=0]', {
            onclick: () => {
              animating = true
              collapsed = !collapsed
            }, 
          },
            children,
          ),
        
        indicator: () => 
          m('span.Toggle' + css`
            display: inline-block;
            transition: transform .3s ease-in-out;
            transform: rotate(${ collapsed ? 180 : 0 }deg);
          `, '^'),

        contents: children =>
          m('.Contents' + css`
            transition: height .3s ease-in-out;
            overflow: hidden;
            height: ${ 
              collapsed ? 0 : container && container.dom.offsetHeight + 'px'
            }
          `, {
            style: !collapsed && !animating && 'height: auto', 
            ontransitionend : ({target}) => {
              animating = false
            },
          },
            container = 
              m('.Container', {

              }, children),
          ),
      })
    )
})