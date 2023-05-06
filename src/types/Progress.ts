import { ID } from './ID'

export type ProgressId = ID<'progress'>

/**
 * Progress is a user facing object? that represents a task that a user can complete.
 */
export type Progress = {
  id: ProgressId
  name: string // User facing
  description?: string // Description
  points?: number // Total is calculated from all progress point
}
