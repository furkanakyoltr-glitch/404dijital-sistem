"use client"
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AnimatedCharactersLogin } from '@/components/ui/animated-characters-login'

export default function TeklifLoginPage() {
  const router = useRouter()

  const handleLogin = async ({ kasaNo, type }: { kasaNo: string; type: string }) => {
    // signIn is handled inside the component via next-auth
    router.push('/kasa')
  }

  return <AnimatedCharactersLogin onLogin={handleLogin} type="musteri" />
}
