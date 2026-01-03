import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const API_URL = 'http://localhost:3001'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedLetter, setSelectedLetter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [pagination, setPagination] = useState({
    nextCursor: null,
    hasMore: false
  })
  const sectionAppeared = useRef(null)
  const loadingRef = useRef(false)
  const debounceTimerRef = useRef(null)
  const fileInputRef = useRef(null)

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
    const searchQuery = searchTerm.trim() || selectedLetter
    setUsers([])
    setPagination({ nextCursor: null, hasMore: false })
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    if (searchTerm.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        fetchUsers(0, 50, false, searchTerm.trim())
      }, 300)
    } else {
      fetchUsers(0, 50, false, selectedLetter)
    }
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [selectedLetter, searchTerm, fetchUsers])

  useEffect(() => {
    if (!pagination.hasMore || !pagination.nextCursor) {
      return
    }

    const searchQuery = searchTerm.trim() || selectedLetter
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasMore && pagination.nextCursor !== null && !loadingRef.current) {
          fetchUsers(pagination.nextCursor, 50, true, searchQuery)
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
  }, [pagination.hasMore, pagination.nextCursor, selectedLetter, searchTerm, fetchUsers])

  const handleLetterClick = (letter) => {
    if (selectedLetter === letter) {
      setSelectedLetter('')
    } else {
      setSelectedLetter(letter)
      setSearchTerm('')
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    if (e.target.value.trim()) {
      setSelectedLetter('')
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.txt')) {
      setError('Please upload a .txt file')
      return
    }

    setUploading(true)
    setError(null)
    setUploadSuccess(false)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setUploadSuccess(true)
      setError(null)
      
      setTimeout(() => {
        setUploadSuccess(false)
        setUsers([])
        setPagination({ nextCursor: null, hasMore: false })
        fetchUsers(0, 50, false, selectedLetter || searchTerm.trim())
      }, 2000)
    } catch (err) {
      setError(err.message)
      setUploadSuccess(false)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="app">
      <h1>Users List</h1>
      
      <div className="upload-section">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload" className="upload-button">
          {uploading ? 'Uploading...' : 'Upload new file'}
        </label>
        {uploadSuccess && (
          <span className="upload-success">✓ File uploaded successfully!</span>
        )}
      </div>
      
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

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search users by name..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <button
            className="clear-search"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
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
          {(selectedLetter || searchTerm.trim()) && users.length === 0 && !loading && (
            <div className="no-results">
              {searchTerm.trim() 
                ? `No users found matching "${searchTerm}"`
                : `No users found starting with "${selectedLetter}"`
              }
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
                {searchTerm.trim() 
                  ? `No more users matching "${searchTerm}"`
                  : selectedLetter 
                    ? `No more users starting with "${selectedLetter}"`
                    : 'No more users to load'
                }
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
