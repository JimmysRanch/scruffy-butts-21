export type WeightClass = 'small' | 'medium' | 'large' | 'giant'

export const WEIGHT_CLASSES = {
  small: { label: 'Small (1-25 lbs)', min: 1, max: 25 },
  medium: { label: 'Medium (26-50 lbs)', min: 26, max: 50 },
  large: { label: 'Large (51-80 lbs)', min: 51, max: 80 },
  giant: { label: 'Giant (81+ lbs)', min: 81, max: 999 }
} as const

export type PricingMethod = 'weight' | 'breed' | 'service' | 'hybrid'

export interface WeightBasedPrice {
  small: number
  medium: number
  large: number
  giant: number
}

export interface ServiceWithPricing {
  id: string
  name: string
  description: string
  duration: number
  category: string
  createdAt: string
  pricingMethod: PricingMethod
  basePrice?: number
  weightPricing?: WeightBasedPrice
  breedPricing?: Record<string, number>
}

export interface PricingSettings {
  defaultMethod: PricingMethod
  taxRate: number
}

export const DEFAULT_SERVICES: Omit<ServiceWithPricing, 'id' | 'createdAt'>[] = [
  {
    name: 'Basic Bath',
    description: 'Includes Shampoo, Blow Out, Brush Out, Ear Cleaning, Nail Trim',
    duration: 60,
    category: 'Bath Services',
    pricingMethod: 'weight',
    weightPricing: {
      small: 30,
      medium: 35,
      large: 40,
      giant: 45
    }
  },
  {
    name: 'Trim Up',
    description: 'Bath + Trim Up: Round Out Paws, Neaten Face, Sanitary Trim',
    duration: 90,
    category: 'Trim Services',
    pricingMethod: 'weight',
    weightPricing: {
      small: 50,
      medium: 60,
      large: 70,
      giant: 80
    }
  },
  {
    name: 'Deluxe Groom',
    description: 'Bath + Trim Up + Custom Haircut',
    duration: 120,
    category: 'Full Groom Services',
    pricingMethod: 'weight',
    weightPricing: {
      small: 60,
      medium: 70,
      large: 80,
      giant: 90
    }
  },
  {
    name: 'Nail Trim',
    description: 'Quick nail trim service',
    duration: 15,
    category: 'Add-On Services',
    pricingMethod: 'service',
    basePrice: 15
  },
  {
    name: 'Conditioning Treatment with Massage',
    description: 'Luxurious conditioning treatment with relaxing massage',
    duration: 20,
    category: 'Add-On Services',
    pricingMethod: 'service',
    basePrice: 25
  },
  {
    name: 'Paw Pad Cream',
    description: 'Moisturizing paw pad treatment',
    duration: 10,
    category: 'Add-On Services',
    pricingMethod: 'service',
    basePrice: 15
  },
  {
    name: 'Teeth Brushing',
    description: 'Dental hygiene service',
    duration: 15,
    category: 'Add-On Services',
    pricingMethod: 'service',
    basePrice: 20
  },
  {
    name: 'Blueberry Facial',
    description: 'Refreshing blueberry facial treatment',
    duration: 15,
    category: 'Add-On Services',
    pricingMethod: 'service',
    basePrice: 20
  },
  {
    name: 'Deshedding',
    description: 'Intensive deshedding treatment',
    duration: 30,
    category: 'Add-On Services',
    pricingMethod: 'weight',
    weightPricing: {
      small: 20,
      medium: 25,
      large: 30,
      giant: 40
    }
  }
]

export function calculateServicePrice(
  service: ServiceWithPricing,
  weightClass?: WeightClass,
  breed?: string
): number {
  if (service.pricingMethod === 'service' && service.basePrice) {
    return service.basePrice
  }

  if (service.pricingMethod === 'weight' && service.weightPricing && weightClass) {
    return service.weightPricing[weightClass]
  }

  if (service.pricingMethod === 'breed' && service.breedPricing && breed) {
    return service.breedPricing[breed] || service.basePrice || 0
  }

  return service.basePrice || 0
}
