import { WeightClass } from './pricing-types'

export interface Pet {
  id: string
  name: string
  breed: string
  customBreed?: string
  isMixedBreed?: boolean
  weightClass?: WeightClass
  age?: number
  birthday?: string
  gender?: 'Male' | 'Female'
  notes?: string
}

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  pets: Pet[]
  createdAt: string
  address?: string
  city?: string
  state?: string
  zip?: string
  notes?: string
  referralSource?: string
}
