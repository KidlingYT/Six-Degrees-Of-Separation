// Thin client for the Feathers `contact-metadata` service in ../web-app.
// Stores app-only extras (tags, notes) keyed by the Apple contact identifier.

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3030'

// Until auth is wired, every mobile user writes as this owner.
export const CURRENT_USER_ID = 'user_1'

export type ContactMetadata = {
  _id: string
  userId: string
  appleContactId: string
  tags: string[]
  notes?: string
  createdAt: number
  updatedAt: number
}

export type InsertContactInput = {
  userId?: string
  appleContactId: string
  tags?: string[]
  notes?: string
}

export async function insertContact(input: InsertContactInput): Promise<ContactMetadata> {
  const res = await fetch(`${API_BASE_URL}/contact-metadata`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: CURRENT_USER_ID, tags: [], ...input })
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`insertContact failed (${res.status}): ${body}`)
  }

  return (await res.json()) as ContactMetadata
}

// Feathers MongoDB adapter caps page size at paginate.max = 50.
const PAGE_SIZE = 50

export type SavedContactSummary = {
  _id: string
  tags: string[]
}

/**
 * Loads every saved-contact row for this user, keyed by `appleContactId`.
 * Pages through the full collection — simpler than `$in` queries and cheap
 * because saved rows are small relative to the user's Apple contacts.
 */
export async function loadSavedContacts(
  userId: string = CURRENT_USER_ID
): Promise<Map<string, SavedContactSummary>> {
  const out = new Map<string, SavedContactSummary>()
  let skip = 0

  while (true) {
    const url =
      `${API_BASE_URL}/contact-metadata` +
      `?userId=${encodeURIComponent(userId)}` +
      `&$limit=${PAGE_SIZE}` +
      `&$skip=${skip}`

    const res = await fetch(url)
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`loadSavedContacts failed (${res.status}): ${body}`)
    }

    const page = (await res.json()) as { total: number; data: ContactMetadata[] }
    for (const row of page.data) {
      out.set(row.appleContactId, { _id: row._id, tags: row.tags ?? [] })
    }

    skip += page.data.length
    if (skip >= page.total || page.data.length === 0) break
  }

  return out
}

export async function updateContactTags(id: string, tags: string[]): Promise<ContactMetadata> {
  const res = await fetch(`${API_BASE_URL}/contact-metadata/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags })
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`updateContactTags failed (${res.status}): ${body}`)
  }

  return (await res.json()) as ContactMetadata
}
