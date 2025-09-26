import { leadsService } from './leadsService';
import { databaseLeadsService } from './database/leadsService';
import { useDatabase } from '@/contexts/DatabaseContext';
import type { Lead, LeadFilters } from './leadsService';

export class HybridLeadsService {
  private getActiveService() {
    const databaseContext = useDatabase();
    return databaseContext.useDatabase && databaseContext.isConnected 
      ? databaseLeadsService 
      : leadsService;
  }

  async createLead(leadData: Omit<Lead, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    return await this.getActiveService().createLead(leadData);
  }

  async getLeadById(id: string): Promise<Lead | null> {
    return await this.getActiveService().getLeadById(id);
  }

  async getAllLeads(): Promise<Lead[]> {
    return await this.getActiveService().getAllLeads();
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    return await this.getActiveService().updateLead(id, updates);
  }

  async deleteLead(id: string): Promise<void> {
    return await this.getActiveService().deleteLead(id);
  }

  async searchLeads(query: string, filters?: LeadFilters): Promise<Lead[]> {
    return await this.getActiveService().searchLeads(query, filters);
  }

  async getLeadStats() {
    return await this.getActiveService().getLeadStats();
  }

  async migrateToDatabase(): Promise<void> {
    if (!useDatabase().isConnected) {
      throw new Error('Database not connected');
    }

    try {
      const localStorageLeads = leadsService.getAllLeads();
      
      for (const lead of localStorageLeads) {
        try {
          const { id, status, createdAt, updatedAt, ...leadData } = lead;
          await databaseLeadsService.createLead(leadData);
          console.log(`Migrated lead: ${lead.firstName} ${lead.lastName}`);
        } catch (error) {
          console.error(`Failed to migrate lead ${lead.id}:`, error);
        }
      }

      console.log(`Migration completed: ${localStorageLeads.length} leads processed`);
    } catch (error) {
      throw new Error(`Migration failed: ${error}`);
    }
  }
}

export const hybridLeadsService = new HybridLeadsService();