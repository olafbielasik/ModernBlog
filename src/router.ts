export type Route =
  | { path: "/"; params: {} }
  | { path: "/auth"; params: {} }
  | { path: "/new"; params: {} }
  | { path: "/post/:id"; params: { id: string } }

export function go(path: string) {
  if (!path.startsWith("/")) path = "/" + path
  location.hash = "#" + path
}

export function parseRoute(): Route {
  const h = location.hash.replace(/^#/, "") || "/"
  const parts = h.split("/").filter(Boolean)

  if (h === "/") return { path: "/", params: {} }
  if (h === "/auth") return { path: "/auth", params: {} }
  if (h === "/new") return { path: "/new", params: {} }
  if (parts[0] === "post" && parts[1]) {
    return { path: "/post/:id", params: { id: parts[1] } }
  }
  // fallback
  return { path: "/", params: {} }
}
