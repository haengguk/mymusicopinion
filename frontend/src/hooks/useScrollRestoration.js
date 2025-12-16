import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * 스크롤 복원을 수동으로 관리하는 훅.
 * 'POP' (뒤로 가기) 시에만 스크롤을 스마트하게 복원하고,
 * 새로운 탐색이나 탭 변경 시에는 최상단으로 초기화함.
 * 
 * @param {string} key - 스토리지 키 (페이지/탭별 고유)
 * @param {any} dependency - 복원 트리거 (주로 데이터 목록)
 */
export const useScrollRestoration = (key, dependency) => {
    const location = useLocation()
    const navType = useNavigationType() // POP, PUSH, REPLACE (탐색 유형)

    // 1. 브라우저의 기본 복원 기능 비활성화
    useLayoutEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual'
        }
    }, [])

    const hasRestored = useRef(false)
    const lastKey = useRef(key)

    // 키 변경 감지 (탭 전환)
    const isKeyChanged = lastKey.current !== key
    if (isKeyChanged) {
        hasRestored.current = false
        lastKey.current = key
    }

    // 2. 메인 스크롤 로직
    useEffect(() => {
        const shouldRestore = Array.isArray(dependency) ? dependency.length > 0 : !!dependency

        // 이번 사이클에서 로직이 아직 실행되지 않았을 때
        if (!hasRestored.current && shouldRestore) {

            // 우선순위: 키 변경 또는 새로운 탐색 (PUSH/REPLACE) -> 최상단으로 초기화
            if (isKeyChanged || navType === 'PUSH' || navType === 'REPLACE') {
                console.log(`📜 [Scroll] 최상단으로 초기화 (사유: ${isKeyChanged ? '탭 변경' : navType})`)
                window.scrollTo(0, 0)
                hasRestored.current = true
            }
            // 뒤로 가기 (POP) -> 특정 위치로 복원
            else if (navType === 'POP') {
                const savedPos = sessionStorage.getItem(key)
                if (savedPos) {
                    const y = parseInt(savedPos, 10)
                    console.log(`📜 [Scroll] ${y} 위치로 복원 (사유: POP)`)

                    // 레이아웃 준비를 위해 약간의 지연 후 복원 시도
                    setTimeout(() => {
                        window.scrollTo(0, y)
                    }, 100)
                } else {
                    // 저장된 위치가 없으면? 최상단으로 기본 설정
                    window.scrollTo(0, 0)
                }
                hasRestored.current = true
            }
        }
    }, [dependency, key, navType, isKeyChanged])

    // 3. 스크롤 위치 저장 (실시간)
    useEffect(() => {
        const handleScroll = () => {
            sessionStorage.setItem(key, window.scrollY.toString())
        }

        // 쓰로틀링(Throttling) 적용
        let ticking = false
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll()
                    ticking = false
                })
                ticking = true
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [key])
}
