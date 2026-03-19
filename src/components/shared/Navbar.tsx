import { Sparkles, Image, Layers, GalleryHorizontal, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface Props {
  mode: 'single' | 'batch' | 'gallery'
  onModeChange: (mode: 'single' | 'batch' | 'gallery') => void
}

export function Navbar({ mode, onModeChange }: Props) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() { logout(); navigate('/login') }

  const navItems = [
    { id: 'single', label: '이미지 생성', icon: Image },
    { id: 'batch', label: '배치 생성', icon: Layers },
    { id: 'gallery', label: '갤러리', icon: GalleryHorizontal },
  ] as const

  return (
    <header className="h-16 border-b border-white/[0.06] bg-[#0c0c0f]/90 backdrop-blur-xl flex items-center px-8 gap-8 sticky top-0 z-50">
      <div className="flex items-center gap-3 mr-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-900/50">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">Whisk</span>
      </div>

      <nav className="flex items-center gap-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onModeChange(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === id
                ? 'bg-white/[0.08] text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="ml-auto relative">
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-slate-300 hidden md:block font-medium">{user?.name}</span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1c1c23] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 py-1.5 z-20 animate-fade-in">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
