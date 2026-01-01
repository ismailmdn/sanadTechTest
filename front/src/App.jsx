import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const API_URL = 'http://localhost:3001'

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    nextCursor: null,
    hasMore: false
  })
  const sectionAppeared = useRef(null)
  const loadingRef = useRef(false)

  const fetchUsers = useCallback(async (cursor = 0, limit = 50, append = false) => {
    if (loadingRef.current) return
    
    loadingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_URL}/users?limit=${limit}&cursor=${cursor}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const newUsers = data.users || []
      
      if (append) {
        setUsers(prevUsers => [...prevUsers, ...newUsers])
      } else {
        setUsers(newUsers)
      }
      
      setPagination({
        nextCursor: data.nextCursor,
        hasMore: data.hasMore || false
      })
    } catch (err) {
      setError(err.message)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [])

  useEffect(() => {
    fetchUsers(0, 50, false)
  }, [fetchUsers])

  useEffect(() => {
    if (!pagination.hasMore || !pagination.nextCursor) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasMore && pagination.nextCursor !== null && !loadingRef.current) {
          fetchUsers(pagination.nextCursor, 50, true)
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const currentTarget = sectionAppeared.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [pagination.hasMore, pagination.nextCursor, fetchUsers])

  return (
    <div className="app">
      <h1>Users List</h1>
      
      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      {loading && users.length === 0 ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-list">
          {users.map((user) => (
            <div key={user.id} className="user-item">
              <span className="user-id">#{user.id}</span>
              <span className="user-name">{user.username}</span>
            </div>
          ))}
          
          <div ref={sectionAppeared} className="observer-target"></div>
          
          {loading && users.length > 0 && (
            <div className="loading-more">Loading more users...</div>
          )}
          
          {!pagination.hasMore && users.length > 0 && (
            <div className="end-message">No more users to load</div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
