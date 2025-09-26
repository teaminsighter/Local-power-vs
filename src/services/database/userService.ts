import { supabase, DatabaseUser, DatabaseError } from '@/lib/database';
import type { User } from '@/contexts/AuthContext';

export class DatabaseUserService {
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          is_active: userData.isActive
        })
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to create user: ${error.message}`, error.code);
      }

      return this.mapDatabaseUserToUser(data);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to create user: ${error}`);
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new DatabaseError(`Failed to get user: ${error.message}`, error.code);
      }

      return this.mapDatabaseUserToUser(data);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to get user: ${error}`);
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new DatabaseError(`Failed to get user by email: ${error.message}`, error.code);
      }

      return this.mapDatabaseUserToUser(data);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to get user by email: ${error}`);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseError(`Failed to get users: ${error.message}`, error.code);
      }

      return data.map(user => this.mapDatabaseUserToUser(user));
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to get users: ${error}`);
    }
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id'>>): Promise<User> {
    try {
      const updateData: any = {};
      
      if (updates.email) updateData.email = updates.email;
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
      if (updates.role) updateData.role = updates.role;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to update user: ${error.message}`, error.code);
      }

      return this.mapDatabaseUserToUser(data);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to update user: ${error}`);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        throw new DatabaseError(`Failed to delete user: ${error.message}`, error.code);
      }
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to delete user: ${error}`);
    }
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        return null;
      }

      const user = await this.getUserByEmail(email);
      return user && user.isActive ? user : null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) {
        throw new DatabaseError(`Failed to change password: ${error.message}`, error.message);
      }
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Failed to change password: ${error}`);
    }
  }

  private mapDatabaseUserToUser(dbUser: DatabaseUser): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      role: dbUser.role,
      isActive: dbUser.is_active
    };
  }
}

export const databaseUserService = new DatabaseUserService();