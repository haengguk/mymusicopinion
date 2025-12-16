import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Disc, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const { user, logout } = useAuth()
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: '홈', path: '/' },
        { name: '음악', path: '/songs' },
        { name: '커뮤니티', path: '/board' },
    ]

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4' : 'py-6 bg-transparent'
            }`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="relative">
                        <Disc className="w-8 h-8 text-indigo-500 group-hover:rotate-180 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">MMO</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-sm font-medium transition-colors hover:text-white ${location.pathname === link.path ? 'text-white' : 'text-slate-400'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="relative group">
                            <button className="flex items-center gap-2 text-sm font-bold text-white bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all">
                                <User className="w-4 h-4" />
                                {user.username}
                            </button>

                            {/* Dropdown Menu - Pure CSS Hover/Group based or could use state if preferred, sticking to group-hover for simplicity or click if needed. 
                                Let's use group-hover for now as it's easiest without extra state, 
                                but for better UX usually click is better. Let's stick to group-hover for simplicity.
                                Actually, let's use a small invisible bridge so it doesn't close immediately.
                            */}
                            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 w-48">
                                <div className="bg-[#181818] border border-white/10 rounded-xl shadow-xl overflow-hidden p-1">
                                    <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
                                        <User className="w-4 h-4" /> 마이페이지
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4" /> 로그아웃
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                로그인
                            </Link>
                            <Link to="/signup" className="px-4 py-2 text-sm font-bold bg-white text-slate-950 rounded-lg hover:bg-slate-200 transition-colors">
                                회원가입
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-slate-950 border-b border-white/5 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="text-slate-300 hover:text-white font-medium"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <hr className="border-white/10" />
                            {user ? (
                                <>
                                    <div className="text-slate-300 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {user.username}
                                    </div>
                                    <button onClick={() => { logout(); setIsOpen(false); }} className="text-left text-red-400 font-bold">
                                        로그아웃
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-slate-300">로그인</Link>
                                    <Link to="/signup" onClick={() => setIsOpen(false)} className="text-indigo-400 font-bold">회원가입</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
