import { useState, useEffect } from 'react'
import { User, Save, Lock, AlertCircle, MessageSquare, FileText, Star, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function ProfilePage() {
    const navigate = useNavigate()
    const [userInfo, setUserInfo] = useState({
        username: '',
        bio: '',
    })
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState({ type: '', text: '' })

    // My Activity State
    const [activeTab, setActiveTab] = useState('reviews')
    const [myReviews, setMyReviews] = useState([])
    const [myPosts, setMyPosts] = useState([])

    useEffect(() => {
        fetchUserInfo()
        fetchMyActivity()
    }, [])

    const fetchUserInfo = async () => {
        try {
            const res = await api.get('/users/me')
            setUserInfo({
                username: res.data.username,
                bio: res.data.bio || ''
            })
        } catch (err) {
            console.error("Failed to fetch user info", err)
        } finally {
            setLoading(false)
        }
    }

    const fetchMyActivity = async () => {
        try {
            const [reviewsRes, postsRes] = await Promise.all([
                api.get('/users/me/reviews'),
                api.get('/users/me/posts')
            ])
            setMyReviews(reviewsRes.data)
            setMyPosts(postsRes.data)
        } catch (err) {
            console.error("Failed to fetch activity", err)
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setMessage({ type: '', text: '' })

        try {
            await api.put('/users/me', {
                bio: userInfo.bio,
                password: password || undefined
            })
            setMessage({ type: 'success', text: '정보가 성공적으로 수정되었습니다.' })
            setPassword('')
        } catch (err) {
            console.error(err)
            setMessage({ type: 'error', text: '정보 수정에 실패했습니다.' })
        }
    }

    if (loading) return <div className="min-h-screen bg-[#121212] pt-24 text-center text-white">Loading...</div>

    return (
        <div className="min-h-screen bg-[#121212] text-white pt-32 pb-12 px-6">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="md:col-span-1 h-fit sticky top-32">
                        <div className="bg-[#181818] p-8 rounded-2xl border border-white/5 text-center">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                                <span className="text-4xl font-bold">{userInfo.username.charAt(0).toUpperCase()}</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">{userInfo.username}</h2>
                            <p className="text-slate-400 text-sm mb-6">MMO 멤버</p>

                            <div className="bg-white/5 rounded-xl p-4 text-left">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">소개</div>
                                <p className="text-sm text-slate-300 italic">
                                    {userInfo.bio || "아직 소개글이 없습니다."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Edit Form */}
                        <div className="bg-[#181818] p-8 rounded-2xl border border-white/5">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <User className="text-indigo-500" /> 내 정보 수정
                            </h3>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">닉네임 (변경 불가)</label>
                                    <input
                                        type="text"
                                        value={userInfo.username}
                                        disabled
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">한 줄 소개</label>
                                    <textarea
                                        value={userInfo.bio}
                                        onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors h-24 resize-none"
                                        placeholder="나를 표현하는 한 줄 소개를 입력하세요."
                                    />
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-200">
                                        <Lock className="w-4 h-4" /> 비밀번호 변경
                                    </h4>
                                    <div className="bg-yellow-500/10 text-yellow-500 text-sm p-4 rounded-lg mb-4 flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span>비밀번호를 변경하려면 아래에 새 비밀번호를 입력하세요.</span>
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                        placeholder="새 비밀번호 입력"
                                    />
                                </div>

                                {message.text && (
                                    <div className={`p-4 rounded-lg text-sm font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        저장하기
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* My Activity Section */}
                        <div className="bg-[#181818] p-8 rounded-2xl border border-white/5">
                            <h3 className="text-xl font-bold mb-6">내 활동</h3>

                            {/* Tabs */}
                            <div className="flex border-b border-indigo-500/20 mb-6">
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                >
                                    <MessageSquare className="w-4 h-4" /> 나의 리뷰
                                </button>
                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'posts' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                >
                                    <FileText className="w-4 h-4" /> 나의 게시글
                                </button>
                            </div>

                            {/* Content */}
                            <div className="min-h-[200px]">
                                {activeTab === 'reviews' && (
                                    <div className="space-y-4">
                                        {myReviews.length > 0 ? (
                                            myReviews.map(review => (
                                                <div
                                                    key={review.id}
                                                    onClick={() => navigate(`/songs/${review.songId}`)}
                                                    className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex gap-4 items-center group"
                                                >
                                                    <img
                                                        src={review.songImageUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"}
                                                        alt={review.songTitle}
                                                        className="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{review.songTitle}</h4>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="flex text-yellow-500">
                                                                {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                                            </div>
                                                            <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-300 line-clamp-1">{review.comment}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 text-slate-600 flex flex-col items-center">
                                                <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                                                <p>작성한 리뷰가 없습니다.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'posts' && (
                                    <div className="space-y-4">
                                        {myPosts.length > 0 ? (
                                            myPosts.map(post => (
                                                <div
                                                    key={post.id}
                                                    onClick={() => navigate(`/board/${post.id}`)}
                                                    className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex justify-between items-center group"
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{post.category === 'RECOMMEND' ? '추천' : '자유'}</span>
                                                            <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{post.title}</h4>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                                                            {post.commentCount > 0 && <span className="text-indigo-400">댓글 {post.commentCount}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 text-slate-600 flex flex-col items-center">
                                                <FileText className="w-12 h-12 mb-2 opacity-20" />
                                                <p>작성한 게시글이 없습니다.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
