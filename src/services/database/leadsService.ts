import { supabase, DatabaseLead, DatabaseSystemDetails, DatabaseError } from '@/lib/database';
import type { Lead, LeadFilters, SystemDetails } from '@/services/leadsService';

export class DatabaseLeadsService {
  async createLead(leadData: Omit<Lead, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    try {
      const { data: leadResult, error: leadError } = await supabase
        .from('leads')
        .insert({
          first_name: leadData.firstName,
          last_name: leadData.lastName,
          email: leadData.email,
          phone: leadData.phone,
          contact_preference: leadData.contactPreference,
          best_time_to_call: leadData.bestTimeToCall,
          status: 'new',
          source: leadData.source,
          score: leadData.score,
          tags: leadData.tags,
          notes: leadData.notes
        })
        .select()
        .single();

      if (leadError) {
        throw new DatabaseError(`Failed to create lead: ${leadError.message}`, leadError.code);
      }

      if (leadData.systemDetails) {
        const { error: systemError } = await supabase
          .from('system_details')
          .insert({
            lead_id: leadResult.id,
            system_size: leadData.systemDetails.systemSize,
            estimated_cost: leadData.systemDetails.estimatedCost,
            annual_savings: leadData.systemDetails.annualSavings,
            payback_period: leadData.systemDetails.paybackPeriod,
            panel_count: leadData.systemDetails.panelCount,
            roof_area: leadData.systemDetails.roofArea,
            monthly_bill: leadData.systemDetails.monthlyBill,
            usage_kwh: leadData.systemDetails.usageKwh,
            address: leadData.systemDetails.address,
            property_type: leadData.systemDetails.propertyType,
            roof_type: leadData.systemDetails.roofType
          });

        if (systemError) {
          await supabase.from('leads').delete().eq('id', leadResult.id);
          throw new DatabaseError(`Failed to create system details: ${systemError.message}`, systemError.code);
        }
      }

      return await this.getLeadById(leadResult.id) as Lead;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to create lead: ${error}`);
    }
  }

  async getLeadById(id: string): Promise<Lead | null> {
    try {
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select(`
          *,
          system_details (*)
        `)
        .eq('id', id)
        .single();

      if (leadError) {
        if (leadError.code === 'PGRST116') return null;
        throw new DatabaseError(`Failed to get lead: ${leadError.message}`, leadError.code);
      }

      return this.mapDatabaseLeadToLead(leadData);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to get lead: ${error}`);
    }
  }

  async getAllLeads(): Promise<Lead[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          system_details (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseError(`Failed to get leads: ${error.message}`, error.code);
      }

      return data.map(lead => this.mapDatabaseLeadToLead(lead));
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to get leads: ${error}`);
    }
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    try {
      const updateData: any = {};
      
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.contactPreference) updateData.contact_preference = updates.contactPreference;
      if (updates.bestTimeToCall) updateData.best_time_to_call = updates.bestTimeToCall;
      if (updates.status) updateData.status = updates.status;
      if (updates.source) updateData.source = updates.source;
      if (updates.score !== undefined) updateData.score = updates.score;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.notes) updateData.notes = updates.notes;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          system_details (*)
        `)
        .single();

      if (error) {
        throw new DatabaseError(`Failed to update lead: ${error.message}`, error.code);
      }

      return this.mapDatabaseLeadToLead(data);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to update lead: ${error}`);
    }
  }

  async deleteLead(id: string): Promise<void> {
    try {
      const { error: systemError } = await supabase
        .from('system_details')
        .delete()
        .eq('lead_id', id);

      if (systemError) {
        throw new DatabaseError(`Failed to delete system details: ${systemError.message}`, systemError.code);
      }

      const { error: leadError } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (leadError) {
        throw new DatabaseError(`Failed to delete lead: ${leadError.message}`, leadError.code);
      }
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to delete lead: ${error}`);
    }
  }

  async searchLeads(query: string, filters?: LeadFilters): Promise<Lead[]> {
    try {
      let dbQuery = supabase
        .from('leads')
        .select(`
          *,
          system_details (*)
        `);

      if (query) {
        dbQuery = dbQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);
      }

      if (filters?.status && filters.status.length > 0) {
        dbQuery = dbQuery.in('status', filters.status);
      }

      if (filters?.source && filters.source.length > 0) {
        dbQuery = dbQuery.in('source', filters.source);
      }

      if (filters?.tags && filters.tags.length > 0) {
        dbQuery = dbQuery.overlaps('tags', filters.tags);
      }

      if (filters?.scoreRange) {
        if (filters.scoreRange.min !== undefined) {
          dbQuery = dbQuery.gte('score', filters.scoreRange.min);
        }
        if (filters.scoreRange.max !== undefined) {
          dbQuery = dbQuery.lte('score', filters.scoreRange.max);
        }
      }

      if (filters?.dateRange) {
        if (filters.dateRange.start) {
          dbQuery = dbQuery.gte('created_at', filters.dateRange.start);
        }
        if (filters.dateRange.end) {
          dbQuery = dbQuery.lte('created_at', filters.dateRange.end);
        }
      }

      dbQuery = dbQuery.order('created_at', { ascending: false });

      const { data, error } = await dbQuery;

      if (error) {
        throw new DatabaseError(`Failed to search leads: ${error.message}`, error.code);
      }

      return data.map(lead => this.mapDatabaseLeadToLead(lead));
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to search leads: ${error}`);
    }
  }

  async getLeadStats(): Promise<{
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
    conversionRate: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('status');

      if (error) {
        throw new DatabaseError(`Failed to get lead stats: ${error.message}`, error.code);
      }

      const stats = {
        total: data.length,
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        conversionRate: 0
      };

      data.forEach(lead => {
        switch (lead.status) {
          case 'new':
            stats.new++;
            break;
          case 'contacted':
            stats.contacted++;
            break;
          case 'qualified':
            stats.qualified++;
            break;
          case 'converted':
            stats.converted++;
            break;
        }
      });

      stats.conversionRate = stats.total > 0 ? (stats.converted / stats.total) * 100 : 0;

      return stats;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to get lead stats: ${error}`);
    }
  }

  private mapDatabaseLeadToLead(dbLead: any): Lead {
    const systemDetails = dbLead.system_details?.[0] ? {
      systemSize: dbLead.system_details[0].system_size,
      estimatedCost: dbLead.system_details[0].estimated_cost,
      annualSavings: dbLead.system_details[0].annual_savings,
      paybackPeriod: dbLead.system_details[0].payback_period,
      panelCount: dbLead.system_details[0].panel_count,
      roofArea: dbLead.system_details[0].roof_area,
      monthlyBill: dbLead.system_details[0].monthly_bill,
      usageKwh: dbLead.system_details[0].usage_kwh,
      address: dbLead.system_details[0].address,
      propertyType: dbLead.system_details[0].property_type,
      roofType: dbLead.system_details[0].roof_type
    } : undefined;

    return {
      id: dbLead.id,
      firstName: dbLead.first_name,
      lastName: dbLead.last_name,
      email: dbLead.email,
      phone: dbLead.phone,
      contactPreference: dbLead.contact_preference,
      bestTimeToCall: dbLead.best_time_to_call,
      status: dbLead.status,
      source: dbLead.source,
      score: dbLead.score,
      tags: dbLead.tags || [],
      notes: dbLead.notes,
      systemDetails,
      createdAt: dbLead.created_at,
      updatedAt: dbLead.updated_at
    };
  }
}

export const databaseLeadsService = new DatabaseLeadsService();