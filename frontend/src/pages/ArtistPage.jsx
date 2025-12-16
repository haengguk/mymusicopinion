import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Disc, Star, Music, ExternalLink } from 'lucide-react'
import api from '../api/axios'

export default function ArtistPage() {
    const { artistName } = useParams()
    const navigate = useNavigate()

    const [topTracks, setTopTracks] = useState([])
    const [albums, setAlbums] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // 병렬 페칭 (Parallel fetch)
                const [tracksRes, albumsRes] = await Promise.all([
                    api.get(`/artists/${artistName}/top-tracks`),
                    api.get(`/artists/${artistName}/albums`)
                ])

                setTopTracks(tracksRes.data)
                setAlbums(albumsRes.data)
            } catch (error) {
                console.error("Failed to fetch artist data", error)
            } finally {
                setLoading(false)
            }
        }

        if (artistName) {
            fetchData()
        }
    }, [artistName])

    const goToDetail = (trackId) => {
        // DB ID와 iTunes ID 모두 처리 가능하도록 (여기서는 DB ID 사용)
        navigate(`/songs/${trackId}`)
    }

    // 아티스트 이미지 대체 (첫 번째 앨범 아트 또는 기본 이미지 사용)
    const artistImage = albums.length > 0
        ? albums[0].artworkUrl100?.replace('100x100', '600x600')
        : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop"

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400">아티스트 정보를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-6">
            <div className="container mx-auto max-w-5xl">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    뒤로가기
                </button>

                {/* Artist Header */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-48 h-48 rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl relative"
                    >
                        <img
                            src={artistImage}
                            alt={artistName}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                    <div className="text-center md:text-left">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-2"
                        >
                            {artistName}
                        </motion.h1>
                        <p className="text-indigo-400 font-medium text-lg">Artist</p>
                    </div>
                </div>

                {/* Section 1: Top Rated Songs (DB) */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Star className="text-yellow-500 fill-current" />
                        우리들의 명곡 (Top Rated)
                    </h2>

                    {topTracks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {topTracks.map((track, idx) => (
                                <motion.div
                                    key={track.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => goToDetail(track.itunesTrackId || track.id)} // 상세 페이지로 이동 링크 사용
                                    className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-4 group"
                                >
                                    <span className="text-2xl font-bold text-slate-700 w-8 text-center group-hover:text-indigo-500 transition-colors">
                                        {idx + 1}
                                    </span>
                                    <img
                                        src={track.imageUrl}
                                        alt={track.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white truncate">{track.title}</h3>
                                        <p className="text-slate-500 text-sm">{track.album}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1 text-yellow-500 font-bold">
                                            <Star className="w-4 h-4 fill-current" />
                                            {track.averageRating.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            리뷰 {track.reviewCount}개
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-slate-500 bg-slate-900 p-8 rounded-xl text-center border border-slate-800 border-dashed">
                            아직 등록된 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!
                        </div>
                    )}
                </section>

                {/* Section 2: Latest Albums (iTunes) */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Disc className="text-pink-500" />
                        최신 앨범 (Latest Releases)
                    </h2>

                    {albums.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {albums.map((album) => (
                                <a
                                    key={album.collectionId}
                                    href={album.collectionViewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block"
                                >
                                    <div className="aspect-square rounded-xl overflow-hidden mb-3 relative border border-slate-800 group-hover:border-pink-500 transition-colors">
                                        <img
                                            src={album.artworkUrl100?.replace('100x100', '400x400')}
                                            alt={album.collectionName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <ExternalLink className="text-white w-8 h-8" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-200 text-sm line-clamp-2 leading-tight group-hover:text-white transition-colors">
                                        {album.collectionName}
                                    </h3>
                                    <p className="text-slate-500 text-xs mt-1">
                                        {new Date(album.releaseDate).getFullYear()}
                                    </p>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-slate-500 bg-slate-900 p-8 rounded-xl text-center border border-slate-800 border-dashed">
                            앨범 정보를 불러올 수 없습니다.
                        </div>
                    )}
                </section>

            </div>
        </div>
    )
}
