import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        type: { label: 'Type', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const type = credentials.type || 'admin'
        if (type === 'admin') {
          const admin = await prisma.admin.findUnique({ where: { email: credentials.email } })
          if (!admin) return null
          const valid = await bcrypt.compare(credentials.password, admin.password)
          if (!valid) return null
          return { id: admin.id, email: admin.email, name: admin.name, role: admin.role, type: 'admin' }
        } else {
          const musteri = await prisma.musteri.findFirst({
            where: { OR: [{ kasaNo: credentials.email }, { email: credentials.email }] }
          })
          if (!musteri) return null
          const valid = await bcrypt.compare(credentials.password, musteri.sifre)
          if (!valid) return null
          return { id: musteri.id, email: musteri.email, name: musteri.firmaAdi, role: 'musteri', type: 'musteri', kasaNo: musteri.kasaNo }
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as any).role; token.type = (user as any).type; token.kasaNo = (user as any).kasaNo }
      return token
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).id = token.id; (session.user as any).role = token.role; (session.user as any).type = token.type; (session.user as any).kasaNo = token.kasaNo }
      return session
    }
  },
  pages: { signIn: '/giris' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}
