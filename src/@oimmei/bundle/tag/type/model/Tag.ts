export interface Tag {
  id: number
  label: string
  color: string
  icon?: string | null
}
export interface TagFilter {
  label: string | null
}

export const newTag: Tag = {
  id: 0,
  label: '',
  color: '#000000',
}
