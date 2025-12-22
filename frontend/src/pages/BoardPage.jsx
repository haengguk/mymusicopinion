import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, ThumbsUp, PenSquare, Search, Music, Calendar, User, Heart } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useScrollRestoration } from '../hooks/useScrollRestoration'

export default function BoardPage() {
    const [activeTab, setActiveTab] = useState(() => {
        return sessionStorage.getItem('board_active_tab') || 'FREE'
    }) // FREE 또는 RECOMMEND

    // 무한 스크롤 상태 (Infinite Scroll State)
    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)

    const { user } = useAuth()
    const navigate = useNavigate()

    // 스크롤 복원을 위한 커스텀 훅
    useScrollRestoration(`board_scroll_${activeTab}`, posts)

    // 카테고리 제목 목업 데이터 (Mock category titles)
    const categories = {
        'FREE': { label: '자유게시판', icon: MessageSquare, desc: '자유롭게 이야기를 나누는 공간입니다.' },
        'RECOMMEND': { label: '노래 추천', icon: ThumbsUp, desc: '나만 알기 아까운 명곡을 추천해주세요!' }
    }

    // 게시글 가져오기 함수 (Fetch Posts Function)
    const fetchPosts = async (pageNum, isNewTab = false) => {
        if (!isNewTab && loading) return // 중복 요청 방지
        setLoading(true)
        try {
            const response = await api.get(`/api/board?category=${activeTab}&size=20&page=${pageNum}&sort=createdAt,desc`)
            const newPosts = response.data.content
            const isLast = response.data.last

            setPosts(prev => isNewTab ? newPosts : [...prev, ...newPosts])
            setHasMore(!isLast)
        } catch (error) {
            console.error("Failed to fetch posts", error)
        } finally {
            setLoading(false)
        }
    }

    // 탭 변경 효과 (Tab Change Effect)
    useEffect(() => {
        sessionStorage.setItem('board_active_tab', activeTab)
        // 모든 상태 초기화
        setPage(0)
        setHasMore(true)
        setPosts([])
        fetchPosts(0, true)
    }, [activeTab])

    // 무한 스크롤 효과 (Infinite Scroll Effect)
    useEffect(() => {
        if (loading || !hasMore) return

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setPage(prev => {
                        const nextPage = prev + 1
                        fetchPosts(nextPage, false) // 다음 페이지 가져오기
                        return nextPage
                    })
                }
            },
            { threshold: 1.0 }
        )

        const sentinel = document.getElementById('scroll-sentinel')
        if (sentinel) observer.observe(sentinel)

        return () => observer.disconnect()
    }, [loading, hasMore, activeTab]) // 로딩 상태가 변경되면 다시 바인딩하여 잠금 해제

    const handleWrite = () => {
        if (!user) {
            alert('로그인이 필요한 서비스입니다.')
            navigate('/login')
            return
        }
        // 카테고리 상태와 함께 글쓰기 페이지로 이동
        navigate('/board/write', { state: { category: activeTab } })
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-6">
            <div className="container mx-auto max-w-5xl">

                {/* Header */}
                <div className="mb-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-4"
                    >
                        커뮤니티
                    </motion.h1>
                    <p className="text-slate-400">음악을 사랑하는 사람들과 소통해보세요.</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-10">
                    <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 flex gap-2">
                        {Object.keys(categories).map((cat) => {
                            const isActive = activeTab === cat
                            const Icon = categories[cat].icon
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`
                                        relative px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                                        ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
                                    `}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-indigo-600 rounded-xl"
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        {categories[cat].label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Sub-header & Action */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="text-left">
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                            {categories[activeTab].label}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">{categories[activeTab].desc}</p>
                    </div>
                    <button
                        onClick={handleWrite}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <PenSquare className="w-4 h-4" />
                        글쓰기
                    </button>
                </div>

                {/* List */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[400px]">
                    {/* 게시글이 있으면 리스트 렌더링 */}
                    {(posts.length > 0 || !loading) && (
                        <div className="flex flex-col divide-y divide-slate-800">
                            {posts.map((post) => (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={post.id}
                                    onClick={() => navigate(`/board/${post.id}`)}
                                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-800/40 cursor-pointer transition-all gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        {/* 제목 영역 */}
                                        <div className="flex items-center gap-2 mb-2">
                                            {post.category === 'RECOMMEND' && (
                                                <span className="shrink-0 bg-pink-500/10 text-pink-400 text-[10px] px-2 py-0.5 rounded border border-pink-500/20 font-bold uppercase tracking-wider">
                                                    추천
                                                </span>
                                            )}
                                            <h3 className="text-lg font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                                                {post.title}
                                            </h3>
                                        </div>

                                        {/* 메타 정보 */}
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <div className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
                                                <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                                    <User className="w-3 h-3" />
                                                </div>
                                                <span className="font-medium">{post.username || '익명'}</span>
                                            </div>
                                            <span className="w-0.5 h-0.5 bg-slate-600 rounded-full"></span>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-xs">
                                                    {new Date(post.createdAt).toLocaleString('ko-KR', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 통계 (우측) */}
                                    <div className="flex items-center gap-5 text-slate-500 text-sm font-medium shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/50 sm:pl-6 sm:border-l sm:border-slate-800">
                                        <div className={`flex items-center gap-1.5 ${post.commentCount > 0 ? 'text-indigo-400' : 'opacity-60'}`}>
                                            <MessageSquare className="w-4 h-4" />
                                            <span>{post.commentCount || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 hover:text-pink-500 transition-colors opacity-60 hover:opacity-100">
                                            <Heart className="w-4 h-4" />
                                            <span>{post.likeCount || 0}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* 초기 로딩 표시 (게시글이 없을 때만) */}
                    {loading && posts.length === 0 && (
                        <div className="flex items-center justify-center h-64 text-slate-500">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                                <p>게시글을 불러오는 중입니다...</p>
                            </div>
                        </div>
                    )}

                    {/* 빈 상태 표시 */}
                    {!loading && posts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <MessageSquare className="w-12 h-12 opacity-20 mb-3" />
                            <p>아직 게시글이 없습니다. 첫 글을 남겨보세요!</p>
                        </div>
                    )}

                    {/* 무한 스크롤 감지 센티넬 (항상 바닥에 위치) */}
                    <div id="scroll-sentinel" className="h-10 flex items-center justify-center text-slate-600 py-4">
                        {loading && posts.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm">More posts...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
