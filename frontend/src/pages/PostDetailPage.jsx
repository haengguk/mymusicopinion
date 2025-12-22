import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Calendar, MessageSquare, ThumbsUp, Heart } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function PostDetailPage() {
    const { postId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Comments State
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [commentLoading, setCommentLoading] = useState(false)

    useEffect(() => {
        fetchPost()
        fetchComments()
    }, [postId])

    const fetchPost = async () => {
        try {
            const res = await api.get(`/api/board/${postId}`)
            setPost(res.data)
        } catch (err) {
            console.error(err)
            setError('게시글을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const fetchComments = async () => {
        try {
            const res = await api.get(`/api/board/${postId}/comments`)
            // Backend now uses /posts/{postId}/comments and returns Page<PostComment>
            // Need to check if it returns .content or raw list. Default Page returns .content
            setComments(res.data.content || res.data)
        } catch (err) {
            console.error('Failed to fetch comments', err)
            // Fallback for old endpoint if existed (optional)
        }
    }

    const handlePostLike = async () => {
        if (!user) {
            alert("로그인이 필요합니다.")
            return
        }

        // Optimistic Update
        const previousPost = { ...post }
        setPost(prev => ({
            ...prev,
            likeCount: prev.likeCount + 1 // 좋아요 취소 기능이 없다면 무조건 +1, 토글이라면 로직 필요. 백엔드는 토글임.
            // 백엔드가 토글이므로 프론트엔드도 현재 상태(내가 좋아요 했는지)를 알아야 완벽한 낙관적 업데이트 가능.
            // 하지만 현재 API 응답에 'liked' 여부가 없음. 일단 +1/-1 토글을 가정하거나, 
            // 단순히 즉각적인 반응을 위해 "숫자만이라도 올리는 척" 할 수 있지만, 
            // UX상 "토글"이므로 내가 이미 눌렀는지 모르면 +1 해야할지 -1 해야할지 모름.
            // API에서 'liked' 필드를 안 내려주면 낙관적 업데이트가 불가능함.
            // 하지만 사용자 요청은 "숫자가 늦게 올라간다"임.
            // 차선책: API 호출 후 fetchPost() 대신, 성공했다고 가정하고 숫자만 올리기? 
            // 아니면 그냥 로딩없이 바로 fetchPost() 결과 반영? (fetch가 빠르면 됨)
            // 가장 좋은 방법: fetchPost를 백그라운드에서 하고, UI는 낙관적으로 처리.
            // 여기서는 단순히 "반응성을 높여달라"는 것이므로, 
            // 일단 +1 했다가 fetchPost 결과로 보정하는 전략 사용. (대부분 사용자는 좋아요를 누르니까)
        }))

        try {
            await api.post(`/api/board/${postId}/like`)
            fetchPost() // 서버 데이터로 최종 동기화
        } catch (err) {
            console.error(err)
            alert("좋아요 처리에 실패했습니다.")
            setPost(previousPost) // 실패 시 롤백
        }
    }

    const handleCommentLike = async (commentId) => {
        if (!user) {
            alert("로그인이 필요합니다.")
            return
        }

        // Optimistic Update for Comment
        const previousComments = [...comments]
        setComments(prev => prev.map(c =>
            c.id === commentId ? { ...c, likeCount: (c.likeCount || 0) + 1 } : c
        ))

        try {
            await api.post(`/api/board/${postId}/comments/${commentId}/like`)
            fetchComments() // 서버 데이터로 최종 동기화
        } catch (err) {
            console.error(err)
            alert("댓글 좋아요 처리에 실패했습니다.")
            setComments(previousComments) // 롤백
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return
        if (!user) {
            alert("로그인이 필요합니다.")
            return
        }

        // Optimistic UI: 사용자가 입력한 댓글 미리 보여주기 (임시 ID 사용)
        const tempId = Date.now()
        const optimisticComment = {
            id: tempId,
            content: newComment,
            username: user.username || '나', // 현재 로그인한 유저 정보 활용
            createdAt: new Date().toISOString(),
            likeCount: 0
        }

        // 목록 끝에 추가 (기본 정렬이 과거->최신이라면)
        setComments(prev => [...prev, optimisticComment])
        const commentToSubmit = newComment
        setNewComment('') // 입력창 초기화

        setCommentLoading(true)
        try {
            await api.post(`/api/board/${postId}/comments`, {
                comment: commentToSubmit
            })
            fetchComments() // 실제 데이터로 교체
        } catch (err) {
            console.error(err)
            alert("댓글 작성에 실패했습니다.")
            setComments(prev => prev.filter(c => c.id !== tempId)) // 실패 시 제거
            setNewComment(commentToSubmit) // 입력 내용 복구
        } finally {
            setCommentLoading(false)
        }
    }

    if (loading) return <div className="min-h-screen bg-slate-950 pt-24 text-center text-white">Loading...</div>
    if (error) return <div className="min-h-screen bg-slate-950 pt-24 text-center text-red-500">{error}</div>
    if (!post) return <div className="min-h-screen bg-slate-950 pt-24 text-center text-white">Post not found</div>

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-6">
            <div className="container mx-auto max-w-4xl">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/board')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    목록으로 돌아가기
                </button>

                {/* Content Card */}
                <div className="bg-[#181818] rounded-2xl border border-white/5 overflow-hidden mb-8">
                    {/* Header */}
                    <div className="p-8 border-b border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${post.category === 'RECOMMEND' ? 'bg-pink-500/10 text-pink-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                {post.category === 'RECOMMEND' ? '노래 추천' : '자유게시판'}
                            </span>
                            <span className="text-slate-500 text-sm flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <span className="font-medium">{post.username || '익명'}</span>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8 min-h-[200px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {/* Song Card if Exists */}
                        {post.songTitle && (
                            <div
                                onClick={() => navigate(`/songs/${post.songId}`)}
                                className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex gap-4 items-center mb-8 group max-w-lg"
                            >
                                <img
                                    src={post.songImageUrl}
                                    alt={post.songTitle}
                                    className="w-20 h-20 rounded-lg object-cover shadow-lg"
                                />
                                <div>
                                    <div className="text-xs text-indigo-400 font-bold mb-1">추천하는 노래</div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{post.songTitle}</h3>
                                    <p className="text-slate-400">{post.songArtist}</p>
                                </div>
                            </div>
                        )}

                        {post.content}
                    </div>

                    {/* Footer / Stats */}
                    <div className="bg-white/5 p-4 flex items-center justify-between text-sm text-slate-400">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePostLike}
                                className="flex items-center gap-1.5 hover:text-pink-500 transition-colors"
                            >
                                <Heart className={`w-4 h-4 ${post.likeCount > 0 ? 'fill-pink-500 text-pink-500' : ''}`} />
                                <span>좋아요 {post.likeCount || 0}</span>
                            </button>
                            <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> 댓글 {comments.length}</span>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-[#181818] rounded-2xl border border-white/5 p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <MessageSquare className="text-indigo-500" />
                        댓글 <span className="text-slate-500 text-base font-normal">{comments.length}개</span>
                    </h3>

                    {/* Write Comment */}
                    <form onSubmit={handleAddComment} className="mb-8 flex gap-4">
                        <input
                            type="text"
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors"
                            placeholder={user ? "댓글을 입력하세요..." : "로그인이 필요합니다."}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={!user || commentLoading}
                        />
                        <button
                            type="submit"
                            disabled={!user || commentLoading || !newComment.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                        >
                            등록
                        </button>
                    </form>

                    {/* Comment List */}
                    <div className="space-y-6">
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <div key={comment.id} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center">
                                        <User className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-200">{comment.username || '익명'}</span>
                                                <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <button
                                                onClick={() => handleCommentLike(comment.id)}
                                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-pink-500 transition-colors"
                                            >
                                                <Heart className={`w-3 h-3 ${comment.likeCount > 0 ? 'fill-pink-500 text-pink-500' : ''}`} />
                                                {comment.likeCount || 0}
                                            </button>
                                        </div>
                                        <p className="text-slate-300">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-600">
                                아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
