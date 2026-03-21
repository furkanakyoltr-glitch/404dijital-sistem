"use client"
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AnimatedCharactersLogin } from '@/components/ui/animated-characters-login'

export default function AdminGirisPage() {
  const router = useRouter()

  const handleLogin = async ({ kasaNo }: { kasaNo: string }) => {
    const result = await signIn('credentials', {
      email: kasaNo,
      password: '',
      type: 'admin',
      redirect: false,
    })
    if (result?.ok) router.push('/admin')
  }

  return (
    <div className="min-h-screen">
      <AnimatedCharactersLogin onLogin={handleLogin} type="admin" />
    </div>
  )
}
