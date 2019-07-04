export const viewOf = v => (
    typeof v.attrs.view == 'function'
  ?
    v.attrs.view
  :
    typeof v.children[0] == 'function'
  ?
    v.children[0]
  :
    typeof v.children[0].children == 'function'
  ?
    v.children[0].children
  :
    () => v.children
)

export const Inline = v => (
  typeof v.attrs.view === 'function'
?
  ({view(){
    return v.attrs.view(...arguments)
  }})
:
  typeof v.children[0] === 'function'
?
  v.children[0](v)
:
  console.error('Inline component must be provided with a closure or POJO component declaration as its first argument')
)
