export function escapeHTML(html) {
  const div = document.createElement("div")
  div.innerHTML = html
  return div.innerText || div.textContent || ""
}

export function toArray(NodeList) {
  return Array.prototype.slice.call(NodeList)
}

export function Maybe(item) {
  return {
    then(fn) { // (a -> b) -> Maybe b
      if(item) return Maybe(fn(item))
      return Maybe()
    },
    catch(fn) {
      if(!item) return Maybe(fn())
    },
    combine(_Maybe, fn) {
      return _Maybe.then(b => fn(item, b))
    }
  }
}

export function find(query) {
  const results = toArray(document.querySelectorAll(query))
    .slice(0, 1)
  return results.length ? Maybe(results[0]) : Maybe()
}
