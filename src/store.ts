import { Post, User } from "./types"

const k = {
  posts: "mb_posts",
  user: "mb_user"
}

export const store = {
  getUser(): User | null {
    const raw = localStorage.getItem(k.user)
    return raw ? JSON.parse(raw) as User : null
  },
  setUser(u: User | null) {
    if (u) localStorage.setItem(k.user, JSON.stringify(u))
    else localStorage.removeItem(k.user)
  },
  getPosts(): Post[] {
    const raw = localStorage.getItem(k.posts)
    const list = raw ? JSON.parse(raw) as Post[] : []
    return list.sort((a, b) => b.createdAt - a.createdAt)
  },
  addPost(p: Post) {
    const list = this.getPosts()
    list.push(p)
    localStorage.setItem(k.posts, JSON.stringify(list))
  },
  getPost(id: string): Post | null {
    return this.getPosts().find(p => p.id === id) || null
  }
}
