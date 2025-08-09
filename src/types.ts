export type User = { id: string; name: string }
export type Post = { id: string; title: string; content: string; cover?: string; authorId: string; authorName: string; createdAt: number }
export type Route = { path: string; params: Record<string, string> }
