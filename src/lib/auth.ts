import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'admin@localpower.ie'
        },
        password: { 
          label: 'Password', 
          type: 'password' 
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        try {
          // Validate and sanitize input credentials
          // Basic email validation
          const email = credentials.email.trim().toLowerCase();
          const password = credentials.password;
          
          if (!email.includes('@') || password.length < 1) {
            throw new Error('Invalid email or password format');
          }

          // For now, use environment variables (later we'll use database)
          const adminEmail = process.env.ADMIN_EMAIL;
          const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

          if (!adminEmail || !adminPasswordHash) {
            throw new Error('Admin credentials not configured');
          }

          // Check if email matches
          if (email !== adminEmail) {
            throw new Error('Invalid credentials');
          }

          // Verify password with bcrypt
          const isValidPassword = await bcrypt.compare(
            password, 
            adminPasswordHash
          );

          if (!isValidPassword) {
            throw new Error('Invalid credentials');
          }

          // Return user object (will be stored in JWT)
          return {
            id: 'admin-user',
            email: adminEmail,
            name: 'Local Power Admin',
            role: 'admin',
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/admin/login',
    error: '/admin/login?error=true',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add role to token on first login
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to session
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', {
        email: user.email,
        provider: account?.provider,
        timestamp: new Date().toISOString()
      });
    },
    async signOut({ session, token }) {
      console.log('User signed out:', {
        email: session?.user?.email,
        timestamp: new Date().toISOString()
      });
    }
  }
};