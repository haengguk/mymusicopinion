import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Music, Disc, Play, Pause, Plus, Star } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import api from '../api/axios'

// Debounce helper
const useDebounce = (callback, delay) => {
    const timer = useRef(null)

    return useCallback((...args) => {
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => {
            callback(...args)
        }, delay)
    }, [callback, delay])
}

export default function SongsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchType, setSearchType] = useState('all') // all, song, artist
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [playingPreview, setPlayingPreview] = useState(null) // URL of playing preview

    const [visibleLimit, setVisibleLimit] = useState(20)
    const navigate = useNavigate()

    const searchMusic = async (term, type) => {
        console.log("🔍 [Frontend] Searching:", { term, type })
        if (!term.trim()) {
            setResults([])
            return
        }
        setLoading(true)
        setVisibleLimit(20) // Reset pagination
        try {
            const response = await api.get(`/api/music/search?term=${encodeURIComponent(term)}&type=${type}`)
            setResults(response.data)
        } catch (error) {
            console.error("Search failed", error)
        } finally {
            setLoading(false)
        }
    }

    const debouncedSearch = useDebounce((term, type) => searchMusic(term, type), 500)

    const handleInput = (e) => {
        const val = e.target.value
        setSearchTerm(val)
        debouncedSearch(val, searchType)
    }

    const handleTypeChange = (e) => {
        const val = e.target.value
        setSearchType(val)
        if (searchTerm) {
            searchMusic(searchTerm, val) // Immediate search on type change
        }
    }

    const togglePreview = (e, url) => {
        e.stopPropagation() // Prevent card click
        if (playingPreview === url) {
            setPlayingPreview(null)
            const audio = document.getElementById('audio-preview')
            if (audio) audio.pause()
        } else {
            setPlayingPreview(url)
            setTimeout(() => {
                const audio = document.getElementById('audio-preview')
                if (audio) {
                    audio.src = url
                    audio.play()
                }
            }, 0)
        }
    }

    const goToDetail = (track) => {
        navigate(`/songs/${track.itunesTrackId || track.trackId}`, { state: { track } })
    }

    const visibleResults = results.slice(0, visibleLimit)

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-6">
            <audio id="audio-preview" onEnded={() => setPlayingPreview(null)} className="hidden" />

            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6"
                    >
                        <Music className="w-4 h-4" />
                        <span className="text-sm font-bold">iTunes API 연동</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        음악 검색
                    </motion.h1>
                    <p className="text-slate-400">좋아하는 가수나 노래 제목을 검색해보세요.</p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto mb-16">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-50" />
                    <div className="relative flex items-center gap-2 bg-slate-900/80 border border-slate-700 rounded-full p-2 shadow-2xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">

                        {/* Selector */}
                        <select
                            value={searchType}
                            onChange={handleTypeChange}
                            className="bg-transparent text-slate-300 font-medium py-3 pl-6 pr-2 outline-none border-r border-slate-700 cursor-pointer hover:text-white transition-colors"
                        >
                            <option value="all" className="bg-slate-900">전체</option>
                            <option value="song" className="bg-slate-900">제목</option>
                            <option value="artist" className="bg-slate-900">가수</option>
                        </select>

                        <Search className="text-slate-400 w-6 h-6 ml-2 shrink-0" />
                        <input
                            type="text"
                            className="w-full bg-transparent py-3 px-2 text-lg placeholder:text-slate-500 focus:outline-none"
                            placeholder="검색어를 입력하세요..."
                            value={searchTerm}
                            onChange={handleInput}
                            autoFocus
                        />

                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    {loading ? (
                        // Skeleton Loading State
                        Array(8).fill(0).map((_, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                                <Skeleton className="aspect-square" height="100%" borderRadius={0} />
                                <div className="p-5">
                                    <Skeleton width="80%" height={24} className="mb-2" />
                                    <Skeleton width="60%" height={20} className="mb-4" />
                                    <Skeleton width="40%" height={16} />
                                    <Skeleton height={40} className="mt-4 rounded-lg" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <AnimatePresence>
                            {visibleResults.map((track, idx) => (
                                <motion.div
                                    key={track.trackId}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => goToDetail(track)}
                                    className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all cursor-pointer"
                                >
                                    <div className="aspect-square relative overflow-hidden">
                                        {/* Artwork - use higher res if possible by string replace */}
                                        <img
                                            src={track.artworkUrl100?.replace('100x100', '600x600')}
                                            alt={track.trackName}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            {track.previewUrl && (
                                                <button
                                                    onClick={(e) => togglePreview(e, track.previewUrl)}
                                                    className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                                                >
                                                    {playingPreview === track.previewUrl ? (
                                                        <Pause className="w-5 h-5 fill-current" />
                                                    ) : (
                                                        <Play className="w-5 h-5 fill-current ml-1" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">{track.trackName}</h3>
                                        <p className="text-indigo-400 text-sm font-medium mb-3">{track.artistName}</p>

                                        {/* Rating Display */}
                                        {track.reviewCount > 0 && (
                                            <div className="flex items-center gap-1.5 text-yellow-500 text-sm mb-3 font-medium">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span>{track.averageRating ? track.averageRating.toFixed(1) : '0.0'}</span>
                                                <span className="text-slate-500 text-xs font-normal">({track.reviewCount})</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span className="truncate max-w-[60%]">{track.collectionName}</span>
                                            <span>{track.releaseDate?.substring(0, 4)}</span>
                                        </div>

                                        {/* Link button (Review Write) */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); goToDetail(track); }}
                                            className="w-full mt-4 py-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            리뷰 쓰기
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Pagination (Load More) */}
                {results.length > visibleLimit && (
                    <div className="flex justify-center pb-10">
                        <button
                            onClick={() => setVisibleLimit(prev => prev + 20)}
                            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition-colors"
                        >
                            더 보기 ({visibleResults.length} / {results.length})
                        </button>
                    </div>
                )}

                {!loading && results.length === 0 && searchTerm && (
                    <div className="text-center py-20 text-slate-500">
                        <Disc className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>검색 결과가 없습니다.</p>
                    </div>
                )}

                {!loading && !searchTerm && (
                    <div className="text-center py-20 text-slate-600">
                        <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>검색어를 입력하여 음악을 찾아보세요.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
