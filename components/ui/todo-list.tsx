"use client"
import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface Todo {
  id: string
  icerik: string
  tamamlandi: boolean
  sonTarih?: string
  sira: number
}

export function TodoList({ musteriId }: { musteriId: string }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [yeniTodo, setYeniTodo] = useState('')
  const [yeniTarih, setYeniTarih] = useState('')

  useEffect(() => {
    fetch(`/api/musteriler/${musteriId}/todo`)
      .then(r => r.json())
      .then(setTodos)
      .catch(() => setTodos([
        { id: '1', icerik: 'Meta reklam hesabını bağla', tamamlandi: true, sira: 0 },
        { id: '2', icerik: 'İçerik takvimi hazırla', tamamlandi: false, sonTarih: '2026-03-25', sira: 1 },
        { id: '3', icerik: 'Rakip analizi raporu', tamamlandi: false, sonTarih: '2026-03-28', sira: 2 },
      ]))
  }, [musteriId])

  const toggle = async (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, tamamlandi: !t.tamamlandi } : t))
    await fetch(`/api/musteriler/${musteriId}/todo`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).catch(() => {})
  }

  const add = async () => {
    if (!yeniTodo.trim()) return
    const todo: Todo = { id: Date.now().toString(), icerik: yeniTodo, tamamlandi: false, sonTarih: yeniTarih || undefined, sira: todos.length }
    setTodos(prev => [...prev, todo])
    setYeniTodo('')
    setYeniTarih('')
    await fetch(`/api/musteriler/${musteriId}/todo`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icerik: yeniTodo, sonTarih: yeniTarih, musteriId }),
    }).catch(() => {})
  }

  const remove = async (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/musteriler/${musteriId}/todo?id=${id}`, { method: 'DELETE' }).catch(() => {})
  }

  const tamamlananlar = todos.filter(t => t.tamamlandi).length
  const yuzde = todos.length > 0 ? (tamamlananlar / todos.length) * 100 : 0

  return (
    <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a]">YAPILACAKLAR</h3>
        <span className="text-sm font-montserrat text-[#555]">{tamamlananlar}/{todos.length}</span>
      </div>

      {/* Progress */}
      <div className="h-2 bg-[#f0f0f0] rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-[#1a1a1a] rounded-full transition-all duration-500" style={{ width: `${yuzde}%` }} />
      </div>

      {/* Add */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Yeni görev ekle..."
          value={yeniTodo}
          onChange={e => setYeniTodo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          className="flex-1 border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
        />
        <input
          type="date"
          value={yeniTarih}
          onChange={e => setYeniTarih(e.target.value)}
          className="border border-[#eaeaea] rounded-xl px-3 py-2.5 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
        />
        <button onClick={add} className="btn-primary p-2.5 rounded-xl h-auto aspect-square flex items-center justify-center">
          <Plus size={16} />
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {todos.sort((a, b) => a.sira - b.sira).map(todo => (
          <div
            key={todo.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${todo.tamamlandi ? 'bg-[#f8f9fa] border-[#f0f0f0] opacity-60' : 'bg-white border-[#eaeaea]'}`}
          >
            <button
              onClick={() => toggle(todo.id)}
              className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${todo.tamamlandi ? 'bg-[#1a1a1a] border-[#1a1a1a]' : 'border-[#ccc] hover:border-[#1a1a1a]'}`}
            >
              {todo.tamamlandi && <span className="text-white text-xs leading-none">✓</span>}
            </button>
            <span className={`flex-1 text-sm font-montserrat ${todo.tamamlandi ? 'line-through text-[#999]' : 'text-[#333]'}`}>
              {todo.icerik}
            </span>
            {todo.sonTarih && (
              <span className="text-xs text-[#999] font-mono flex-shrink-0">
                {new Date(todo.sonTarih).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
              </span>
            )}
            <button onClick={() => remove(todo.id)} className="text-[#ccc] hover:text-red-400 transition-colors flex-shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
