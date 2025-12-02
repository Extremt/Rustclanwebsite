import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Server, Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface Wipe {
  id: string
  server: string
  date: string
  time: string
  notes: string
}

interface WipesPageProps {
  isLoggedIn: boolean
  token: string | null
}

export function WipesPage({ isLoggedIn, token }: WipesPageProps) {
  const [wipes, setWipes] = useState<Wipe[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Wipe | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const servers = [
    'Rusty Moose EU Small',
    'Rusty Moose EU Low',
    'Rustopia EU Medium'
  ]

  useEffect(() => {
    fetchWipes()
  }, [])

  const fetchWipes = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/wipes`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      )
      const data = await response.json()
      setWipes(data.sort((a: Wipe, b: Wipe) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    } catch (error) {
      console.error('Failed to fetch wipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editForm || !token) return

    try {
      const url = editingId
        ? `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/wipes/${editingId}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/wipes`

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        await fetchWipes()
        setEditingId(null)
        setEditForm(null)
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Failed to save wipe:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this wipe?')) return

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/wipes/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      await fetchWipes()
    } catch (error) {
      console.error('Failed to delete wipe:', error)
    }
  }

  const startEdit = (wipe: Wipe) => {
    setEditingId(wipe.id)
    setEditForm({ ...wipe })
    setShowAddForm(false)
  }

  const startAdd = () => {
    setShowAddForm(true)
    setEditForm({
      id: '',
      server: servers[0],
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      notes: ''
    })
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
    setShowAddForm(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">Loading wipes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-80 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(26, 21, 18, 0.75), rgba(26, 21, 18, 0.85)), url('https://images.unsplash.com/photo-1597926679689-337d5b996916?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXN0JTIwZ2FtZSUyMHNjcmVlbnNob3R8ZW58MXx8fHwxNzY0NjkwOTI3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-foreground mb-2">Upcoming Server Wipes</h1>
            <p className="text-muted-foreground">Stay updated with our server schedules</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {isLoggedIn && (
          <div className="mb-8">
            <button
              onClick={startAdd}
              disabled={showAddForm}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50"
            >
              <Plus size={20} />
              Add New Wipe
            </button>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && editForm && (
          <div className="bg-card/95 backdrop-blur-sm border border-primary/30 p-6 mb-8 rounded-2xl shadow-xl">
            <h3 className="text-foreground mb-4">Add New Wipe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-foreground mb-2">Server</label>
                <select
                  value={editForm.server}
                  onChange={(e) => setEditForm({ ...editForm, server: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  {servers.map(server => (
                    <option key={server} value={server}>{server}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-foreground mb-2">Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-foreground mb-2">Time</label>
                <input
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-foreground mb-2">Notes</label>
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="w-full px-4 py-2 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
              >
                <Save size={18} />
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-all duration-200"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Wipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wipes.map((wipe) => (
            <div key={wipe.id} className="bg-card/95 backdrop-blur-sm border border-border hover:border-primary transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-primary/20">
              {editingId === wipe.id && editForm ? (
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-foreground mb-2">Server</label>
                      <select
                        value={editForm.server}
                        onChange={(e) => setEditForm({ ...editForm, server: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        {servers.map(server => (
                          <option key={server} value={server}>{server}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-foreground mb-2">Date</label>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-foreground mb-2">Time</label>
                      <input
                        type="time"
                        value={editForm.time}
                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-foreground mb-2">Notes</label>
                      <input
                        type="text"
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
                      >
                        <Save size={18} />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-all duration-200"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Server className="text-primary mt-1 flex-shrink-0" size={24} />
                    <div className="flex-1">
                      <h3 className="text-foreground mb-1">{wipe.server}</h3>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={18} className="text-primary" />
                      <span>{new Date(wipe.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock size={18} className="text-primary" />
                      <span>{wipe.time}</span>
                    </div>
                  </div>

                  {wipe.notes && (
                    <div className="text-muted-foreground border-t border-border pt-4">
                      {wipe.notes}
                    </div>
                  )}

                  {isLoggedIn && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <button
                        onClick={() => startEdit(wipe)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-all duration-200"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(wipe.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-all duration-200"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {wipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No upcoming wipes scheduled</p>
            {isLoggedIn && (
              <p className="text-muted-foreground mt-2">Click "Add New Wipe" to create one</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
