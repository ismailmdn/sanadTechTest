import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const API_URL = 'http://localhost:3001'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedLetter, setSelectedLetter] = useState('')
  const [pagination, setPagination] = useState({
    nextCursor: null,
    hasMore: false
  })
  const sectionAppeared = useRef(null)
  const loadingRef = useRef(false)

  const fetchUsers = useCallback(async (cursor = 0, limit = 50, append = false, searchQuery = '') => {
    if (loadingRef.current) return
    
    loadingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      const searchParam = searchQuery ? `&searchquery=${encodeURIComponent(searchQuery)}` : ''
      const response = await fetch(`${API_URL}/users?limit=${limit}&cursor=${cursor}${searchParam}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const newUsers = data.users || []
      
      if (append) {
        setUsers(prevUsers => [...prevUsers, ...newUsers])
      } else {
        setUsers(newUsers)
        window.scrollTo(0, 0)
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
    setUsers([])
    setPagination({ nextCursor: null, hasMore: false })
    fetchUsers(0, 50, false, selectedLetter)
  }, [selectedLetter, fetchUsers])

  useEffect(() => {
    if (!pagination.hasMore || !pagination.nextCursor) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasMore && pagination.nextCursor !== null && !loadingRef.current) {
          fetchUsers(pagination.nextCursor, 50, true, selectedLetter)
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
  }, [pagination.hasMore, pagination.nextCursor, selectedLetter, fetchUsers])

  const handleLetterClick = (letter) => {
    if (selectedLetter === letter) {
      setSelectedLetter('')
    } else {
      setSelectedLetter(letter)
    }
  }

  return (
    <div className="app">
      <h1>Users List</h1>
      
      <div className="alphabet-menu">
        <button
          className={`alphabet-btn ${selectedLetter === '' ? 'active' : ''}`}
          onClick={() => setSelectedLetter('')}
        >
          All
        </button>
        {ALPHABET.map((letter) => (
          <button
            key={letter}
            className={`alphabet-btn ${selectedLetter === letter ? 'active' : ''}`}
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      {loading && users.length === 0 ? (
        <div className="loading">Loading users...</div>
      ) : (
        <>
          {selectedLetter && users.length === 0 && !loading && (
            <div className="no-results">
              No users found starting with "{selectedLetter}"
            </div>
          )}
          
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
              <div className="end-message">
                {selectedLetter ? `No more users starting with "${selectedLetter}"` : 'No more users to load'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
