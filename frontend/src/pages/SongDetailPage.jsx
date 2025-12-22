import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ArrowLeft, MessageSquare, Play, Pause, Save, Heart, Bookmark, ThumbsUp } from 'lucide-react'
import YouTube from 'react-youtube'
import Skeleton from 'react-loading-skeleton'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function SongDetailPage() {
    const { itunesTrackId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()

    // 초기 데이터 (Initial Data)
    const [songInfo, setSongInfo] = useState(location.state?.track || null)

    const [reviews, setReviews] = useState([])
    const [averageRating, setAverageRating] = useState(0)

    // 상호작용 상태 (Interaction State)
    const [status, setStatus] = useState({ liked: false, favorited: false, reviewed: false })

    const [likeCount, setLikeCount] = useState(0) // 노래 좋아요 수

    // YouTube 상태 (YouTube State)
    const [videoId, setVideoId] = useState(null)

    // 리뷰 정렬 상태 (Review Sort State)
    const [reviewSort, setReviewSort] = useState('latest') // 'latest' or 'likes'

    // 리뷰 폼 상태 (Review Form State)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 오디오 미리듣기 (Audio Preview)
    const [playing, setPlaying] = useState(false)

    useEffect(() => {
        if (!songInfo && !itunesTrackId) {
            navigate('/songs')
            return
        }

        // 전달된 데이터에서 좋아요 수 초기화 (없으면 0)
        // 이상적으로는 최신 노래 데이터를 가져와야 함
        if (songInfo && songInfo.likeCount !== undefined) {
            setLikeCount(songInfo.likeCount)
        }

        fetchSongDetailsAndStatus()
        fetchYoutubeVideo()
    }, [itunesTrackId, user]) // 유저 변경(로그인) 시 다시 가져오기

    useEffect(() => {
        fetchReviews()
    }, [itunesTrackId, reviewSort])

    const fetchSongDetailsAndStatus = async () => {
        try {
            // 먼저 iTunes ID로 가져오기 시도 (기본 가정)
            let dbSong = null
            const defaultImage = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"

            const mapSongData = (rawDbSong) => ({
                ...rawDbSong,
                trackName: rawDbSong.trackName || rawDbSong.title || "Unknown Title",
                artistName: rawDbSong.artistName || rawDbSong.artist || "Unknown Artist",
                collectionName: rawDbSong.collectionName || rawDbSong.album || "Unknown Album",
                artworkUrl100: rawDbSong.artworkUrl100 || rawDbSong.imageUrl || defaultImage,
                primaryGenreName: rawDbSong.primaryGenreName || rawDbSong.genre || "Music",
                // 날짜 형식 처리 또는 연도만 사용
                releaseDate: rawDbSong.releaseDate ? rawDbSong.releaseDate : (rawDbSong.releaseYear ? new Date(rawDbSong.releaseYear, 0, 1).toISOString() : new Date().toISOString()),
                trackId: rawDbSong.itunesTrackId || rawDbSong.id,
                previewUrl: rawDbSong.previewUrl || null
            })

            try {
                const songRes = await api.get(`/api/songs/itunes/${itunesTrackId}`)
                dbSong = mapSongData(songRes.data)
            } catch (err) {
                // 404인 경우, 로컬 전용 노래 ID일 수 있음 (정크 데이터 또는 수동 입력)
                // 기본 키 ID로 가져오기 시도
                console.warn("Failed to fetch by iTunes ID, trying DB ID...", err)
                try {
                    const fallbackRes = await api.get(`/api/songs/${itunesTrackId}`)
                    dbSong = mapSongData(fallbackRes.data)
                } catch (fallbackErr) {
                    console.error("Failed to fetch song by DB ID also", fallbackErr)
                }
            }

            if (dbSong) {
                setSongInfo(dbSong) // 전체 DB 상세 정보로 songInfo 업데이트
                setLikeCount(dbSong.likeCount)

                // 로그인한 경우 상태 가져오기
                if (user) {
                    const statusRes = await api.get(`/api/songs/${dbSong.id}/status`)
                    setStatus(statusRes.data)
                }
            } else {
                // 로드 실패
                console.error("Song not found")
            }
        } catch (error) {
            console.error("Failed to fetch song details", error)
        }
    }

    const fetchReviews = async () => {
        try {
            let songId = null

            // 올바른 DB ID 확인 시도
            try {
                // 먼저 iTunes ID로 시도
                const songRes = await api.get(`/api/songs/itunes/${itunesTrackId}`)
                songId = songRes.data.id
            } catch (err) {
                // 대체: DB ID일 수 있음
                try {
                    const fallbackRes = await api.get(`/api/songs/${itunesTrackId}`)
                    songId = fallbackRes.data.id
                } catch (fallbackErr) {
                    console.error("Could not resolve song ID for reviews", fallbackErr)
                }
            }

            if (songId) {
                // 정렬과 함께 가져오기
                const reviewResponse = await api.get(`/api/reviews?songId=${songId}&sort=${reviewSort}`)
                const fetchedReviews = reviewResponse.data.content || reviewResponse.data
                setReviews(fetchedReviews)

                // 평균 평점 계산
                const total = fetchedReviews.reduce((acc, rev) => acc + rev.rating, 0)
                setAverageRating(fetchedReviews.length ? (total / fetchedReviews.length).toFixed(1) : 0)
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error)
        }
    }

    const fetchYoutubeVideo = async () => {
        // 이미 location state에 songInfo가 있다면 즉시 사용
        // 그렇지 않으면 fetchSongDetailsAndStatus를 기다림 (경쟁 상태 주의 필요, 
        // 하지만 일단 있는 것을 사용하거나 업데이트를 기다림)

        let queryTerm = ""
        if (songInfo) {
            queryTerm = `${songInfo.artistName} ${songInfo.trackName} official audio`
        } else {
            // 처음에 songInfo가 null인 경우 (직접 링크 접근), 기다리거나 itunesId 조회에 의존해야 함
            // 간단하게 하기 위해 정보가 없으면 건너뜀.
            // 이상적으로는 노래 상세 정보 로드 후에 호출해야 함.
            return;
        }

        try {
            const res = await api.get(`/api/music/youtube-video?term=${encodeURIComponent(queryTerm)}`)
            if (res.data && res.data.videoId) {
                setVideoId(res.data.videoId)
            }
        } catch (error) {
            console.error("Failed to fetch YouTube video ID", error)
        }
    }

    // songInfo가 변경되면(예: API 로드 후) 가져오기 트리거
    useEffect(() => {
        if (songInfo && !videoId) {
            fetchYoutubeVideo()
        }
    }, [songInfo])

    const handleToggleLike = async () => {
        if (!user) return alert('로그인이 필요합니다.')
        try {
            // DB ID 필요
            const songRes = await api.get(`/api/songs/itunes/${itunesTrackId}`)
            const songId = songRes.data.id
            await api.post(`/api/songs/${songId}/like`)

            // 낙관적 업데이트 (Optimistic update)
            setLikeCount(prev => status.liked ? prev - 1 : prev + 1)
            setStatus(prev => ({ ...prev, liked: !prev.liked }))
        } catch (error) {
            console.error("Like failed", error)
        }
    }

    const handleToggleFavorite = async () => {
        if (!user) return alert('로그인이 필요합니다.')
        try {
            const songRes = await api.get(`/api/songs/itunes/${itunesTrackId}`)
            const songId = songRes.data.id
            await api.post(`/api/songs/${songId}/favorite`)

            setStatus(prev => ({ ...prev, favorited: !prev.favorited }))
        } catch (error) {
            console.error("Favorite failed", error)
        }
    }

    const handleToggleReviewLike = async (reviewId) => {
        if (!user) return alert('로그인이 필요합니다.')
        try {
            await api.post(`/api/reviews/${reviewId}/like`)
            fetchReviews() // 카운트 업데이트를 위해 새로고침
        } catch (error) {
            console.error("Review like failed", error)
        }
    }

    const handleReviewSubmit = async (e) => {
        e.preventDefault()
        if (!user) {
            alert('로그인이 필요합니다.')
            navigate('/login')
            return
        }

        if (status.reviewed) {
            alert('이미 리뷰를 작성하셨습니다.')
            return
        }

        setIsSubmitting(true)

        const payload = {
            itunesTrackId: songInfo.trackId,
            title: songInfo.trackName,
            artist: songInfo.artistName,
            album: songInfo.collectionName,
            imageUrl: songInfo.artworkUrl100,
            releaseYear: new Date(songInfo.releaseDate).getFullYear(),
            genre: songInfo.primaryGenreName,
            rating: parseInt(rating),
            comment: comment
        }

        try {
            await api.post('/api/reviews', payload)
            setShowReviewForm(false)
            setComment('')
            setStatus(prev => ({ ...prev, reviewed: true }))
            fetchReviews()
        } catch (error) {
            console.error('Review submit failed', error)
            alert(error.response?.data?.message || '리뷰 작성에 실패했습니다.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleAudio = () => {
        const audio = document.getElementById('audio-detail')
        if (!audio) return

        if (playing) {
            audio.pause()
        } else {
            audio.play()
        }
        setPlaying(!playing)
    }

    if (!songInfo) return <div className="text-white pt-32 text-center">Loading...</div>

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-6">
            <audio
                id="audio-detail"
                src={songInfo.previewUrl}
                onEnded={() => setPlaying(false)}
            />

            <div className="container mx-auto max-w-4xl">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    목록으로
                </button>

                {/* 노래 헤더 */}
                <div className="flex flex-col md:flex-row gap-8 mb-16">
                    <div className="relative group shrink-0 mx-auto md:mx-0">
                        <img
                            src={songInfo.artworkUrl100 ? songInfo.artworkUrl100.replace('100x100', '400x400') : "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"}
                            alt={songInfo.trackName}
                            className="w-64 h-64 object-cover rounded-2xl shadow-2xl shadow-indigo-500/20"
                        />
                        {songInfo.previewUrl && (
                            <button
                                onClick={toggleAudio}
                                className="absolute bottom-4 right-4 w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                            >
                                {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left pt-2">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-2"
                        >
                            {songInfo.trackName}
                        </motion.h1>

                        <p
                            className="text-xl text-indigo-400 font-medium mb-6 hover:text-indigo-300 hover:underline cursor-pointer transition-all inline-block"
                            onClick={() => navigate(`/artists/${encodeURIComponent(songInfo.artistName)}`)}
                        >
                            {songInfo.artistName}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-400 text-sm mb-8">
                            <span>{songInfo.collectionName}</span>
                            <span>•</span>
                            <span>{new Date(songInfo.releaseDate).getFullYear()}</span>
                            <span>•</span>
                            <span>{songInfo.primaryGenreName}</span>
                        </div>

                        {/* 노래 상호작용 */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
                            {/* 평점 배지 */}
                            <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/20 text-yellow-500">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="text-xl font-bold">{averageRating}</span>
                                <span className="text-xs opacity-60">/ 5.0</span>
                            </div>

                            {/* 좋아요 버튼 */}
                            <button
                                onClick={handleToggleLike}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${status.liked ? 'bg-pink-500/10 border-pink-500 text-pink-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'}`}
                            >
                                <Heart className={`w-5 h-5 ${status.liked ? 'fill-current' : ''}`} />
                                <span className="font-bold">{likeCount}</span>
                            </button>

                            {/* 즐겨찾기 버튼 */}
                            <button
                                onClick={handleToggleFavorite}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${status.favorited ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'}`}
                            >
                                <Bookmark className={`w-5 h-5 ${status.favorited ? 'fill-current' : ''}`} />
                                <span>{status.favorited ? '저장됨' : '즐겨찾기'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* YouTube 비디오 섹션 */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Play className="text-red-500 fill-current" />
                        뮤직비디오 (MV)
                    </h2>
                    <div className="w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative flex items-center justify-center">
                        {videoId ? (
                            <YouTube
                                videoId={videoId}
                                className="w-full h-full"
                                iframeClassName="w-full h-full"
                                opts={{
                                    width: '100%',
                                    height: '100%',
                                    playerVars: {
                                        autoplay: 0,
                                        modestbranding: 1,
                                        rel: 0
                                    },
                                }}
                            />
                        ) : (
                            <Skeleton className="w-full h-full" height="100%" borderRadius="1rem" />
                        )}
                    </div>
                </div>

                {/* 리뷰 섹션 */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-10">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <MessageSquare className="text-indigo-500" />
                            유저 리뷰 <span className="text-sm font-normal text-slate-500">({reviews.length})</span>
                        </h2>

                        <div className="flex items-center gap-3">
                            {/* 정렬 토글 */}
                            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                                <button
                                    onClick={() => setReviewSort('latest')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${reviewSort === 'latest' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    최신순
                                </button>
                                <button
                                    onClick={() => setReviewSort('likes')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${reviewSort === 'likes' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    추천순
                                </button>
                            </div>

                            {/* 글쓰기 버튼 */}
                            {!status.reviewed ? (
                                <button
                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm"
                                >
                                    {showReviewForm ? '닫기' : '리뷰 쓰기'}
                                </button>
                            ) : (
                                <span className="px-4 py-2 text-slate-500 text-sm font-medium bg-slate-900/50 rounded-lg border border-slate-800">
                                    리뷰 작성 완료
                                </span>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {showReviewForm && (
                            <motion.form
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                onSubmit={handleReviewSubmit}
                                className="mb-10 overflow-hidden"
                            >
                                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-700">
                                    <div className="mb-4">
                                        <label className="block text-sm text-slate-400 mb-2">별점</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-slate-700'}`}
                                                >
                                                    <Star className="w-8 h-8 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm text-slate-400 mb-2">한줄평</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="이 노래에 대한 생각을 남겨주세요..."
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 h-24 resize-none"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            등록
                                        </button>
                                    </div>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="space-y-4">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={review.id}
                                    className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex gap-4 transition-colors hover:border-slate-700"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-200">{review.username || '익명'}</span>
                                                <div className="flex text-yellow-500 text-xs">
                                                    {[...Array(review.rating)].map((_, i) => (
                                                        <Star key={i} className="w-3 h-3 fill-current" />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <span className="text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <p className="text-slate-300 text-sm mb-3">{review.comment}</p>

                                        {/* 리뷰 좋아요 버튼 */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleReviewLike(review.id)}
                                                className="flex items-center gap-1.5 text-slate-500 hover:text-pink-400 transition-colors text-xs font-medium group"
                                            >
                                                <ThumbsUp className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                <span>도움이 돼요</span>
                                                {review.likeCount > 0 && <span className="ml-0.5 text-pink-500">{review.likeCount}</span>}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-600">
                                아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}
