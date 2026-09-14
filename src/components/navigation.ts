import type { ComponentType } from 'react'
import { CompassIcon, HeartIcon, SearchIcon, VinylIcon } from './icons'

export type ViewId = 'discover' | 'artists' | 'liked' | 'search'

export interface NavItem {
  id: ViewId
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'discover', label: 'Discover', icon: CompassIcon },
  { id: 'artists', label: 'Artists', icon: VinylIcon },
  { id: 'liked', label: 'Liked', icon: HeartIcon },
  { id: 'search', label: 'Search', icon: SearchIcon },
]