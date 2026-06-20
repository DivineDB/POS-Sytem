import { BillHistory, BillItem } from './supabase'

export interface CreateBillData {
  tableNumber: string
  type: 'retail' | 'wholesale'
  paymentMethod?: 'cash' | 'online' | 'credit'
  items: {
    id: string
    name: string
    price: number
    quantity: number
  }[]
  subtotal: number
  tax: number
  total: number
}

export class BillService {
  static async createBill(data: CreateBillData): Promise<BillHistory | null> {
    try {
      // Generate bill number
      const billNumber = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

      // Transform items to match database structure
      const billItems: BillItem[] = data.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      }))

      const billData = {
        bill_number: billNumber,
        table_number: data.tableNumber,
        type: data.type,
        payment_method: data.paymentMethod || 'cash',
        items: billItems,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total
      }

      // Use API route to avoid browser CORS/network issues
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData),
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error creating bill:', json.error)
        return null
      }

      return json.data
    } catch (error) {
      console.error('Error in createBill:', error)
      return null
    }
  }

  static async getBills(filters?: {
    type?: 'retail' | 'wholesale'
    dateFrom?: string
    dateTo?: string
    limit?: number
  }): Promise<BillHistory[]> {
    try {
      // Build query params
      const params = new URLSearchParams()
      if (filters?.type) params.set('type', filters.type)
      if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.set('dateTo', filters.dateTo)
      if (filters?.limit) params.set('limit', String(filters.limit))

      const url = `/api/bills${params.toString() ? '?' + params.toString() : ''}`
      const res = await fetch(url)
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error fetching bills:', json.error)
        return []
      }

      return json.data || []
    } catch (error) {
      console.error('Error in getBills:', error)
      return []
    }
  }

  static async getBillById(id: string): Promise<BillHistory | null> {
    try {
      const res = await fetch(`/api/bills/${id}`)
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error fetching bill:', json.error)
        return null
      }

      return json.data
    } catch (error) {
      console.error('Error in getBillById:', error)
      return null
    }
  }

  static async deleteBill(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/bills/${id}`, { method: 'DELETE' })
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error deleting bill:', json.error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteBill:', error)
      return false
    }
  }
}
