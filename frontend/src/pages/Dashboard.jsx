import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Star, TrendingUp, Music, User, MessageSquare, ChevronRight, Disc } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useScrollRestoration } from '../hooks/useScrollRestoration'

export default function Dashboard() {
    const [songs, setSongs] = useState([])
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    // Scroll Restoration
    useScrollRestoration('dashboard_scroll', songs)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Songs (8 items for grid/carousel look)
                // Fetch Reviews (Top 3 popular)
                const [songsRes, reviewsRes] = await Promise.all([
                    api.get('/api/songs?size=8&sort=id,desc&hasReviews=true'),
                    api.get('/api/reviews?size=3&sort=likeCount,desc')
                ])
                // Filter out songs without iTunes ID (likely test/junk data) to keep dashboard clean
                const cleanSongs = songsRes.data.content.filter(song => song.itunesTrackId)
                setSongs(cleanSongs)
                setReviews(reviewsRes.data.content)
            } catch (err) {
                console.error("Failed to fetch dashboard data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-indigo-500 animate-pulse font-bold text-lg">Loading MMO...</div>
            </div>
        )
    }

    // Hero Item: First song or default
    const heroSong = songs.length > 0 ? songs[0] : null

    return (
        <div className="min-h-screen bg-[#121212] text-white pb-24">
            {/* 1. Hero Section */}
            <section className="relative w-full h-[500px] flex items-center overflow-hidden">
                {/* Background Gradient & Image */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-[#121212] to-transparent z-10" />
                    {heroSong ? (
                        <img
                            src={heroSong.imageUrl?.replace('100x100', '1000x1000') || "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop"}
                            alt="Hero Background"
                            className="w-full h-full object-cover opacity-50 block ml-auto w-2/3 mask-image-gradient"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-black" />
                    )}
                </div>

                <div className="container mx-auto px-6 relative z-20 pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl"
                    >
                        <div className="flex items-center gap-2 text-indigo-400 font-bold mb-4">
                            <Star className="fill-current w-5 h-5" />
                            <span>오늘의 추천 앨범</span>
                        </div>
                        {heroSong ? (
                            <>
                                <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight truncate">
                                    {heroSong.title}
                                </h1>
                                <p className="text-2xl text-slate-300 mb-8 font-light flex items-center gap-3">
                                    <span>{heroSong.artist}</span>
                                    {heroSong.averageRating > 0 && (
                                        <span className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1 rounded-full text-base">
                                            <Star className="w-4 h-4 fill-current" /> {heroSong.averageRating.toFixed(1)}
                                        </span>
                                    )}
                                </p>
                                <button
                                    onClick={() => navigate(`/songs/${heroSong.itunesTrackId || heroSong.id}`)}
                                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2"
                                >
                                    <Play className="fill-current w-5 h-5" />
                                    지금 리뷰 보기
                                </button>
                            </>
                        ) : (
                            <>
                                <h1 className="text-5xl font-bold mb-4">환영합니다!</h1>
                                <p className="text-xl text-slate-400 mb-8">아직 등록된 음악이 없습니다. 첫 번째 음악을 검색하고 등록해보세요.</p>
                                <a href="/songs" className="px-8 py-4 bg-indigo-600 rounded-full font-bold">음악 검색하러 가기</a>
                            </>
                        )}
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-6 -mt-10 relative z-30 space-y-20">

                {/* 2. Latest Registered Music grid */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">최신 등록 음악</h2>
                            <p className="text-slate-400">가장 최근에 커뮤니티에 등록된 앨범들입니다.</p>
                        </div>
                        <a href="/songs" className="text-indigo-400 hover:text-white flex items-center gap-1 font-medium transition-colors">
                            전체 보기 <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {songs.map((song, idx) => (
                            <motion.div
                                key={song.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/songs/${song.itunesTrackId || song.id}`)}
                                className="group bg-[#181818] rounded-xl overflow-hidden hover:bg-[#282828] transition-all cursor-pointer shadow-lg hover:shadow-xl"
                            >
                                <div className="aspect-square relative overflow-hidden bg-[#202020]">
                                    {song.imageUrl ? (
                                        <img
                                            src={song.imageUrl.replace('100x100', '400x400')}
                                            alt={song.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Music className="w-12 h-12 text-slate-700" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Play className="w-12 h-12 text-white fill-current drop-shadow-lg" />
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-xs text-yellow-500 font-bold">
                                        <Star className="w-3 h-3 fill-current" />
                                        {song.averageRating ? song.averageRating.toFixed(1) : '0.0'}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-base text-white mb-1 truncate">{song.title}</h3>
                                    <p className="text-slate-400 text-sm truncate mb-3">{song.artist}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-full">
                                            {song.genre || 'Music'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 3. Community (Popular Reviews) */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                                <TrendingUp className="text-indigo-500" /> 인기 리뷰
                            </h2>
                            <p className="text-slate-400">유저들에게 가장 많은 공감을 받은 리뷰입니다.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {reviews.map((review, idx) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[#181818] p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col h-full"
                            >
                                {/* User Info */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                        {review.username ? review.username.substring(0, 1).toUpperCase() : <User className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-200">{review.username || '익명'}</div>
                                        <div className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1 text-yellow-500 font-bold bg-yellow-500/10 px-2 py-1 rounded text-xs">
                                        <Star className="w-3 h-3 fill-current" /> {review.rating}
                                    </div>
                                </div>

                                {/* Link to Song */}
                                <div
                                    onClick={() => navigate(review.songId ? `/songs/${review.songId}` : '#')}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-4 cursor-pointer hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden shrink-0">
                                        {review.songImageUrl ? <img src={review.songImageUrl} className="w-full h-full object-cover" alt="" /> : <Disc className="p-2 w-full h-full text-slate-600" />}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-sm font-bold truncate text-indigo-300">{review.songTitle}</div>
                                        <div className="text-xs text-slate-400 truncate">{review.songArtist}</div>
                                    </div>
                                </div>

                                {/* Review Content */}
                                <p className="text-slate-300 text-sm leading-relaxed mb-4 flex-1">
                                    "{review.comment}"
                                </p>

                                <div className="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t border-white/5 mt-auto">
                                    <span className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> {review.likeCount}명이 공감함
                                    </span>
                                </div>
                            </motion.div>
                        ))}

                        {reviews.length === 0 && (
                            <div className="col-span-full py-10 text-center text-slate-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                아직 등록된 리뷰가 없습니다.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
