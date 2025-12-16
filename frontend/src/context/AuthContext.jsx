import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for token on mount
        const token = localStorage.getItem('token')
        const username = localStorage.getItem('username')

        if (token && username) {
            setUser({ username })
        }
        setLoading(false)
    }, [])

    const login = (token, username) => {
        localStorage.setItem('token', token)
        localStorage.setItem('username', username)
        setUser({ username })
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
