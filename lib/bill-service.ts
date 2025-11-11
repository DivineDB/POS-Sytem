import { supabase, BillHistory, BillItem } from './supabase'

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

      const { data: insertedBill, error } = await supabase
        .from('bill_history')
        .insert([billData])
        .select()
        .single()

      if (error) {
        console.error('Error creating bill:', error)
        return null
      }

      return insertedBill
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
      let query = supabase
        .from('bill_history')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.type) {
        query = query.eq('type', filters.type)
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching bills:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getBills:', error)
      return []
    }
  }

  static async getBillById(id: string): Promise<BillHistory | null> {
    try {
      const { data, error } = await supabase
        .from('bill_history')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching bill:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getBillById:', error)
      return null
    }
  }

  static async deleteBill(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bill_history')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting bill:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteBill:', error)
      return false
    }
  }
}
