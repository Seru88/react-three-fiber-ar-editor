export type XrpServerResponse = {
  error: string | null
  status: string
}

export type Pagination = {
  /** Current page. */
  page: number
  /** Total item count across all pages. */
  total_count: number
}
