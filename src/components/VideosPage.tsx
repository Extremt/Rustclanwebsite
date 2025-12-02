import React, { useState, useEffect } from 'react'
import { Video, Plus, Edit2, Trash2, Save, X, ExternalLink } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface VideoItem {
  id: string
  title: string
  url: string
  description: string
  uploadedAt: string
}

interface VideosPageProps {
  isLoggedIn: boolean
  token: string | null
}

export function VideosPage({ isLoggedIn, token }: VideosPageProps) {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<VideoItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/videos`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      )
      const data = await response.json()
      setVideos(data.sort((a: VideoItem, b: VideoItem) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      ))
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editForm || !token) return

    try {
      const url = editingId
        ? `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/videos/${editingId}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/videos`

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        await fetchVideos()
        setEditingId(null)
        setEditForm(null)
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Failed to save video:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this video?')) return

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/videos/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      await fetchVideos()
    } catch (error) {
      console.error('Failed to delete video:', error)
    }
  }

  const startEdit = (video: VideoItem) => {
    setEditingId(video.id)
    setEditForm({ ...video })
    setShowAddForm(false)
  }

  const startAdd = () => {
    setShowAddForm(true)
    setEditForm({
      id: '',
      title: '',
      url: '',
      description: '',
      uploadedAt: new Date().toISOString()
    })
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
    setShowAddForm(false)
  }

  const getVideoEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
    
    // Convert Twitch URLs to embed format
    if (url.includes('twitch.tv')) {
      const videoId = url.split('videos/')[1]?.split('?')[0]
      return videoId ? `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}` : null
    }
    
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">Loading videos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-80 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(26, 21, 18, 0.75), rgba(26, 21, 18, 0.85)), url('https://images.unsplash.com/photo-1697582046579-66e567525699?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXN0JTIwZ2FtZSUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjQ2OTA5Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-foreground mb-2">Clan Videos</h1>
            <p className="text-muted-foreground">Watch our best moments and raids</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {isLoggedIn && (
          <div className="mb-8">
            <button
              onClick={startAdd}
              disabled={showAddForm}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Plus size={20} />
              Add Video
            </button>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && editForm && (
          <div className="bg-card/95 backdrop-blur-sm border border-primary/30 p-6 mb-8 rounded-2xl shadow-xl">
            <h3 className="text-foreground mb-4">Add New Video</h3>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-foreground mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Video title"
                  className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-foreground mb-2">Video URL</label>
                <input
                  type="text"
                  value={editForm.url}
                  onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                  placeholder="YouTube or Twitch URL"
                  className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                />
                <p className="text-muted-foreground mt-1">Supports YouTube and Twitch URLs</p>
              </div>
              <div>
                <label className="block text-foreground mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Video description"
                  rows={3}
                  className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90"
              >
                <Save size={18} />
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:opacity-90"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-card border-2 border-border hover:border-primary transition-colors">
              {editingId === video.id && editForm ? (
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-foreground mb-2">Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-foreground mb-2">Video URL</label>
                      <input
                        type="text"
                        value={editForm.url}
                        onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                        className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-foreground mb-2">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90"
                      >
                        <Save size={18} />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:opacity-90"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Video Embed */}
                  {getVideoEmbedUrl(video.url) ? (
                    <div className="aspect-video bg-black">
                      <iframe
                        src={getVideoEmbedUrl(video.url) || ''}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-secondary flex items-center justify-center">
                      <div className="text-center p-4">
                        <Video className="text-primary mx-auto mb-2" size={48} />
                        <p className="text-muted-foreground">Video preview not available</p>
                        <a 
                          href={video.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center justify-center gap-2 mt-2"
                        >
                          Open video <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Video Info */}
                  <div className="p-6">
                    <h3 className="text-foreground mb-2">{video.title}</h3>
                    <p className="text-muted-foreground mb-3">{video.description}</p>
                    <p className="text-muted-foreground">
                      {new Date(video.uploadedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>

                    {isLoggedIn && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <button
                          onClick={() => startEdit(video)}
                          className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-12 bg-card border-2 border-border">
            <Video className="text-primary mx-auto mb-4" size={64} />
            <p className="text-muted-foreground">No videos uploaded yet</p>
            {isLoggedIn && (
              <p className="text-muted-foreground mt-2">Click "Add Video" to upload one</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
