export type DataStatus = 'measured' | 'vendor' | 'commercial' | 'editorial' | 'mock'

export interface GSYPlan {
  id: string
  name: string
  price: string
  priceType: 'monthly' | 'yearly-averaged' | 'custom'
  traffic: string
  lineType: string
  speed?: string
  devices: string
  features: string[]
  targetAudience: string
  discount?: string
  dataStatus: DataStatus
}

export interface GSYBrand {
  slug: string
  name: string
  slogan: string
  accentColor: string
  basicInfo: {
    foundedYear: number
    operationYears: number
    positioning: string
    description: string
  }
  plans: GSYPlan[]
  lines: {
    types: string[]
    protocols: string[]
    nodeRegions: string[]
    bandwidth: string
  }
  referral: {
    code: string
    discount: string
    link: string
    disclosure: string
  }
  dataStatus: {
    overall: DataStatus
    overallLabel: string
    notes: string
  }
  verifiedDate: string
  lastUpdated: string
}
