import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Disc, Music, Headphones, Share2, Sparkles, ArrowRight } from 'lucide-react'

// --- Components ---

const HeroSection = () => {
    const navigate = useNavigate()

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />

            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-[128px] animate-pulse delay-1000" />

            <div className="container px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-slate-300">음악에 대한 당신만의 생각</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-tight">
                        당신의 <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
                            음악적 소울을
                        </span>
                        <br />
                        공유하세요
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        당신만의 음악 취향을 공유하고, 새로운 명곡을 발견하세요.
                        <br className="hidden md:block" />
                        솔직한 리뷰와 깊이 있는 토론이 있는 곳, MMO입니다.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                        >
                            <Music className="w-5 h-5" />
                            시작하기
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/songs')}
                            className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 border border-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 hover:border-slate-600 backdrop-blur-sm transition-all"
                        >
                            둘러보기 <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500"
            >
                <div className="w-6 h-10 border-2 border-slate-700 rounded-full flex justify-center p-2">
                    <div className="w-1 h-2 bg-slate-500 rounded-full" />
                </div>
            </motion.div>
        </section>
    )
}

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-all hover:bg-slate-800/50 group"
    >
        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-7 h-7 text-indigo-400" />
        </div>
        <h3 className="text-2xl font-bold mb-4 text-slate-100">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
)

const Features = () => {
    return (
        <section className="py-32 relative z-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={Disc}
                        title="깊이 있는 리뷰"
                        desc="단순한 별점이 아닌, 음악의 구조와 감정에 대한 깊이 있는 리뷰를 남겨보세요."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={Share2}
                        title="커뮤니티"
                        desc="비슷한 취향을 가진 리스너들과 소통하고, 나만의 플레이리스트를 공유하세요."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={Headphones}
                        title="새로운 발견"
                        desc="알고리즘이 아닌, 진짜 음악 애호가들의 추천으로 숨겨진 명곡을 찾아보세요."
                        delay={0.3}
                    />
                </div>
            </div>
        </section>
    )
}

export default function LandingPage() {
    return (
        <div className="bg-slate-950 text-white selection:bg-indigo-500/30">
            <HeroSection />
            <Features />

            <footer className="py-12 border-t border-slate-900 text-center text-slate-500">
                <p>&copy; 2024 My Music Opinion. All rights reserved.</p>
            </footer>
        </div>
    )
}
