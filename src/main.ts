
import { initThree } from "./threebg"
import { parseRoute, go } from "./router"
import { store } from "./store"
import { Post, User } from "./types"
import { el, fmtDate } from "./ui"
import "./style.css"

function uid() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6)
}

function appShell() {
  const user = store.getUser()
  return el("div", { class: "container" }, [
    el("nav", {}, [
      el("a", { href: "#/", class: "brand link" }, [
        el("div", { class: "brand-badge" }),
        el("span", {}, ["Minimal 3D Blog"])
      ]),
      el("div", { class: "actions" }, [
        user ? el("span", { class: "badge" }, ["Signed in as ", el("strong", {}, [user.name])]) : el("a", { href: "#/auth", class: "btn link" }, ["Sign in"]),
        user ? el("a", { href: "#/new", class: "btn link" }, ["New post"]) : null,
        user ? el("button", { onclick: onSignOut }, ["Sign out"]) : null
      ])
    ]),
    el("main", { id: "view" })
  ])

  function onSignOut() {
    store.setUser(null)
    go("/")
    render()
  }
}

function postsGridSection(posts: Post[]) {
  const cards = posts.map(p =>
    el("article", { class: "post-card" }, [
      p.cover ? el("img", { class: "thumb", src: p.cover, alt: "" }) : null,
      el("div", { class: "body" }, [
        el("a", { href: `#/post/${p.id}`, class: "link" }, [
          el("h3", { class: "title" }, [p.title])
        ]),
        el("div", { class: "meta" }, [`by ${p.authorName} • ${fmtDate(p.createdAt)}`])
      ])
    ])
  )

  return el("section", { class: "section card page-enter" }, [
    el("div", { class: "card-inner" }, [
      el("div", { class: "section-header" }, [
        el("div", { class: "section-title" }, ["Latest posts"]),
        el("a", { class: "link", href: "#/new" }, ["Write a post →"])
      ]),
      el("div", { class: "posts-grid" }, cards)
    ])
  ])
}

function viewHome() {
  const posts = store.getPosts()

  const list = el("div", { class: "grid" })
  function renderList(q = "") {
    list.innerHTML = ""
    posts
      .filter(p =>
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.content.toLowerCase().includes(q.toLowerCase())
      )
      .forEach(p => {
        const card = el("article", { class: "post card fade-in" }, [
          el("a", { href: `#/post/${p.id}`, class: "card-inner link" }, [
            p.cover ? el("img", { src: p.cover, alt: "", class: "cover" }) : null,
            el("h3", { class: "h" }, [p.title]),
            el("p", { class: "meta" }, [`by ${p.authorName} • ${fmtDate(p.createdAt)}`])
          ])
        ])
        list.append(card)
      })
  }

  const searchTop = el("input", { type: "text", placeholder: "Search posts...", class: "input", id: "search2" }) as HTMLInputElement
  searchTop.addEventListener("input", () => renderList(searchTop.value))

  const hero = el("section", { class: "hero page-enter" }, [
    el("div", { class: "card" }, [
      el("div", { class: "card-inner" }, [
        el("h1", { class: "title-xl" }, ["Write. Publish. Repeat."]),
        el("p", { class: "subtitle" }, ["A lightweight blog with a gentle 3D glow. Sign in and share your thoughts."]),
        el("div", { class: "flow" }, [
          el("a", { href: store.getUser() ? "#/new" : "#/auth", class: "btn link" }, [store.getUser() ? "Write a post" : "Get started"]),
          el("span", { class: "kbd" }, ["Tip: Press / to focus search"])
        ])
      ])
    ]),
    el("div", { class: "card" }, [
      el("div", { class: "card-inner" }, [
        searchTop,
        el("hr", { class: "sep" }),
        list
      ])
    ])
  ])

  document.addEventListener("keydown", onKey)
  function onKey(e: KeyboardEvent) {
    if (e.key === "/") {
      e.preventDefault()
      searchTop.focus()
    }
  }

  const section = postsGridSection(posts)
  const wrap = el("div", {}, [hero, section])
  return { node: wrap, cleanup: () => document.removeEventListener("keydown", onKey) }
}

function viewAuth() {
  const name = el("input", { class: "input", placeholder: "Your name" }) as HTMLInputElement
  const submit = el("button", { class: "btn", onclick: onSubmit }, ["Sign in"])
  function onSubmit() {
    const v = name.value.trim()
    if (!v) return
    const u: User = { id: uid(), name: v }
    store.setUser(u)
    go("/")
    render()
  }
  const form = el("div", { class: "card page-enter" }, [
    el("div", { class: "card-inner flow" }, [
      el("h2", {}, ["Welcome"]),
      el("p", { class: "subtitle" }, ["Sign in to start publishing."]),
      name,
      submit
    ])
  ])
  const wrap = el("div", { class: "container" }, [form])
  return { node: wrap, cleanup: () => {} }
}

function viewNew() {
  const user = store.getUser()
  if (!user) return viewAuth()

  const title = el("input", { class: "input", placeholder: "My adventure at" }) as HTMLInputElement
  const cover = el("input", { class: "input", placeholder: "Cover image URL (optional)" }) as HTMLInputElement
  const content = el("textarea", { class: "input", style: "height: 260px", placeholder: "Write your story..." }) as HTMLTextAreaElement
  const publish = el("button", { class: "btn", onclick: onPublish }, ["Publish"])

  function onPublish() {
    const t = title.value.trim()
    const c = content.value.trim()
    if (!t || !c) return
    const post: Post = {
      id: uid(),
      title: t,
      content: c,
      cover: cover.value.trim() || "",
      authorId: user.id,
      authorName: user.name,
      createdAt: Date.now()
    }
    store.addPost(post)
    go("/")
    render()
  }

  const form = el("div", { class: "card page-enter" }, [
    el("div", { class: "card-inner flow" }, [
      el("h2", {}, ["New post"]),
      title,
      cover,
      content,
      el("div", {}, [publish])
    ])
  ])
  const wrap = el("div", { class: "container" }, [form])
  return { node: wrap, cleanup: () => {} }
}

function viewPost(id: string) {
  const post = store.getPost(id)
  if (!post) {
    const wrap = el("div", { class: "container" }, [
      el("div", { class: "card page-enter" }, [
        el("div", { class: "card-inner" }, [el("p", {}, ["Post not found."])])
      ])
    ])
    return { node: wrap, cleanup: () => {} }
  }

  const head = el("div", { class: "flow" }, [
    el("h1", { class: "title-xl" }, [post.title]),
    el("p", { class: "meta" }, [`by ${post.authorName} • ${fmtDate(post.createdAt)}`])
  ])
  const body = el("div", { class: "flow" }, [
    post.cover ? el("img", { class: "cover", src: post.cover, alt: "" }) : null,
    el("p", {}, [post.content])
  ])

  const node = el("div", { class: "container" }, [
    el("div", { class: "card page-enter" }, [
      el("div", { class: "card-inner" }, [head, body].filter(Boolean as any))
    ])
  ])
  return { node, cleanup: () => {} }
}

function mountView(node: HTMLElement) {
  const root = document.getElementById("view")
  if (!root) return
  root.innerHTML = ""
  root.append(node)
}

function render() {
  const app = document.getElementById("app")
  if (!app) return
  if (!app.firstChild) app.append(appShell())

  const r = parseRoute()
  const root = document.getElementById("view") as HTMLElement
  if (!root) return

  let cleanup = () => {}
  if (r.path === "/") {
    const v = viewHome()
    mountView(v.node)
    cleanup = v.cleanup
  } else if (r.path === "/auth") {
    const v = viewAuth()
    mountView(v.node)
    cleanup = v.cleanup
  } else if (r.path === "/new") {
    const v = viewNew()
    mountView(v.node)
    cleanup = v.cleanup
  } else if (r.path === "/post/:id") {
    const v = viewPost(r.params.id)
    mountView(v.node)
    cleanup = v.cleanup
  }
}

function startApp() {
  window.addEventListener("hashchange", render)
  initThree()
  render()
}

document.addEventListener('DOMContentLoaded', startApp);