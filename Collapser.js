import m from 'mithril'
import css from 'bss'

import {viewOf} from './utils.js'

export default ({attrs: {collapsed}, container, animating}) => ({
  oncreate: async ({dom}) => {
    await new Promise(requestAnimationFrame)

    void dom.clientWidth

    m.redraw()
  },

  view: v =>
    m('.Collapser',
      viewOf(v)({
        toggle: children =>
          m('.Toggle[tabIndex=0]', {
            onclick(){
              animating = true
              collapsed = !collapsed
            },
          },
            children,
          ),

        indicator: () =>
          m('span.Toggle' + css`
            display   : inline-block;
            transition: transform .3s ease-in-out;
          ` + css`
            transform : rotate(${ collapsed ? 180 : 0 }deg);
          `, '^'),

        contents: children =>
          m('.Contents' + css`
            transition: height .3s ease-in-out;
            overflow  : hidden;
          ` + css`
            height    : ${
              collapsed ? 0 : container && container.dom.offsetHeight + 'px'
            };
          `, {
            style: !collapsed && !animating && 'height: auto',
            ontransitionend(){
              animating = false
            },
          },
            container =
              m('.Container', children),
          ),
      })
    )
})
