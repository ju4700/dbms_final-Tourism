import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from './db'
import User from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await connectDB()
          const user = await User.findOne({ email: credentials.email })
          
          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Always fetch latest staff settings from DB if staff
      if (token.role === 'staff' && (trigger === 'signIn' || trigger === 'update' || !token.customerTableView)) {
        await connectDB()
        let dbUser = null
        if (token.sub) {
          dbUser = await User.findById(token.sub)
        } else if (token.email) {
          dbUser = await User.findOne({ email: token.email })
        }
        if (dbUser && dbUser.preferences && dbUser.preferences.customerViewSettings) {
          token.customerTableView = dbUser.preferences.customerViewSettings
        }
      }
      // On signIn, also set role
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = (token.role as 'admin' | 'staff') || 'staff'
        // For staff, include their customerTableView in the session
        if (token.role === 'staff' && token.customerTableView) {
          (session.user as any).customerTableView = token.customerTableView
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login'
  },
  secret: process.env.NEXTAUTH_SECRET
}
