export default v => (
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