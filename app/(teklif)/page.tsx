"use client"
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AnimatedCharactersLogin } from '@/components/ui/animated-characters-login'

export default function TeklifLoginPage() {
  const router = useRouter()

  const handleLogin = async ({ kasaNo, password }: { kasaNo: string; password: string }) => {
    const result = await signIn('credentials', {
      email: kasaNo,
      password,
      type: 'musteri',
      redirect: false,
    })
    if (result?.ok) {
      router.push('/kasa')
      return true
    }
    return false
  }

  return <AnimatedCharactersLogin onLogin={handleLogin} type="musteri" />
}
