import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Save, Music, Search, X, Loader } from 'lucide-react'
import api from '../api/axios'

export default function PostWritePage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState('FREE')
    const [loading, setLoading] = useState(false)

    // Song Selection State
    const [selectedSong, setSelectedSong] = useState(null)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)

    useEffect(() => {
        if (location.state?.category) {
            setCategory(location.state.category)
        }
    }, [location])

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setSearchLoading(true)
        try {
            const res = await api.get(`/api/music/search?term=${encodeURIComponent(searchQuery)}`)
            setSearchResults(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setSearchLoading(false)
        }
    }

    const handleSelectSong = (song) => {
        setSelectedSong(song)
        setIsSearchOpen(false)
        setSearchResults([])
        setSearchQuery('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                title,
                content,
                category: category.toUpperCase(), // 대문자 강제 변환 (DB 저장 시 "FREE", "RECOMMEND" 유지)
                // Include song data if selected and category is RECOMMEND
                ...(category === 'RECOMMEND' && selectedSong && {
                    itunesTrackId: selectedSong.trackId,
                    songTitle: selectedSong.trackName,
                    songArtist: selectedSong.artistName,
                    songImageUrl: selectedSong.artworkUrl100,
                    previewUrl: selectedSong.previewUrl
                })
            }

            await api.post('/api/board', payload)
            navigate('/board')
        } catch (err) {
            console.error(err)
            alert('글 작성에 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-6">
            <div className="container mx-auto max-w-3xl">

                <button
                    onClick={() => navigate('/board')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    취소하고 돌아가기
                </button>

                <div className="bg-[#181818] rounded-2xl border border-white/5 p-8">
                    <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
                        <span className="text-indigo-500">글쓰기</span>
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Category Selection */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => { setCategory('FREE'); setSelectedSong(null); }}
                                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${category === 'FREE'
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                자유게시판
                            </button>
                            <button
                                type="button"
                                onClick={() => setCategory('RECOMMEND')}
                                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${category === 'RECOMMEND'
                                    ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-500/20'
                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                노래 추천
                            </button>
                        </div>

                        {/* Song Selection (Only for RECOMMEND) */}
                        {category === 'RECOMMEND' && (
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 border-dashed">
                                {selectedSong ? (
                                    <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={selectedSong.artworkUrl100}
                                                alt="Cover"
                                                className="w-16 h-16 rounded-md shadow-md"
                                            />
                                            <div>
                                                <h4 className="font-bold text-white">{selectedSong.trackName}</h4>
                                                <p className="text-slate-400 text-sm">{selectedSong.artistName}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSong(null)}
                                            className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <div className="bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Music className="w-6 h-6 text-pink-500" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">추천할 노래를 선택해주세요</h3>
                                        <p className="text-slate-500 text-sm mb-4">iTunes에서 노래를 검색하여 추가할 수 있습니다.</p>
                                        <button
                                            type="button"
                                            onClick={() => setIsSearchOpen(true)}
                                            className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
                                        >
                                            <Search className="w-4 h-4" />
                                            노래 검색하기
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">제목</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors text-lg font-bold"
                                placeholder="제목을 입력하세요"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">내용</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-80 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors resize-none"
                                placeholder={category === 'RECOMMEND' ? "이 노래를 추천하는 이유를 적어주세요!" : "자유롭게 이야기를 나누어보세요."}
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading || (category === 'RECOMMEND' && !selectedSong)}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
                            >
                                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                등록하기
                            </button>
                        </div>
                    </form>
                </div>

                {/* Search Modal */}
                {isSearchOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-[#181818] w-full max-w-2xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Search className="w-4 h-4 text-pink-500" />
                                    노래 검색
                                </h3>
                                <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-4 border-b border-white/5">
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:border-pink-500 outline-none"
                                        placeholder="노래 제목 또는 아티스트 검색..."
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg"
                                        disabled={searchLoading}
                                    >
                                        검색
                                    </button>
                                </form>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {searchLoading ? (
                                    <div className="text-center py-10 text-slate-500">검색 중...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(song => (
                                        <div
                                            key={song.trackId}
                                            onClick={() => handleSelectSong(song)}
                                            className="flex items-center gap-4 p-3 hover:bg-slate-800 rounded-lg cursor-pointer group transition-colors"
                                        >
                                            <img src={song.artworkUrl100} alt={song.trackName} className="w-12 h-12 rounded bg-slate-900" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white truncate group-hover:text-pink-400">{song.trackName}</h4>
                                                <p className="text-sm text-slate-400 truncate">{song.artistName}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-slate-600">
                                        검색 결과가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
