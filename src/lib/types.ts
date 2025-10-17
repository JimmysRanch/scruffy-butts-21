import { WeightClass } from './pricing-types'

export interface Pet {
  id: string
  name: string
  breed: string
  weightClass?: WeightClass
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
}
