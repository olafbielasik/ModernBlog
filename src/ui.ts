export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, any> = {},
  children: Array<Node | string | null | undefined> = []
) {
  const node = document.createElement(tag)

  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = String(v)
    else if (k === "html") node.innerHTML = String(v)
    else if (k.startsWith("on") && typeof v === "function")
      node.addEventListener(k.slice(2), v as any)
    else if (v !== undefined && v !== null)
      node.setAttribute(k, String(v))
  }

  for (const c of children) {
    if (c === null || c === undefined) continue
    node.append(c instanceof Node ? c : document.createTextNode(String(c)))
  }
  return node
}

export function fmtDate(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}
