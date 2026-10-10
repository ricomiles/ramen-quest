export type PersonId = 'a' | 'b'
export type Person = { id: PersonId; name: string }

export type VisitRow = {
  id: string
  food_type: string
  spot_name: string
  area: string | null
  style: string | null
  lat: number | null
  lng: number | null
  date: string // ISO date
  ordered: string | null
  photos: string[] // public storage URLs
  created_by: PersonId | null
  created_at: string
}

export type Rating = {
  visit_id: string
  person: PersonId
  scores: Record<string, number>
  note: string
}

export type Wish = {
  id: string
  spot_name: string
  note: string | null
  added_by: PersonId | null
  lat: number | null
  lng: number | null
  pinned: boolean
  created_at: string
}

/** A visit with everything derived that the screens need. */
export type Visit = VisitRow & {
  ep: number
  ratings: Partial<Record<PersonId, Rating>>
  overall: Partial<Record<PersonId, number>>
  together: number | null
  /** Partner has rated but I haven't, so their scores are hidden until I do. */
  awaitingMe: boolean
}
