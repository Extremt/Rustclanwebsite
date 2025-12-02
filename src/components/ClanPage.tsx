import React, { useState, useEffect } from 'react'
import { Users, Plus, Edit2, Trash2, Save, X, Shield } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface TeamMember {
  id: string
  name: string
  role: string
  description: string
  avatar: string
}

interface ClanInfo {
  description: string
  discord: string
  website: string
}

interface ClanPageProps {
  isLoggedIn: boolean
  token: string | null
}

export function ClanPage({ isLoggedIn, token }: ClanPageProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [clanInfo, setClanInfo] = useState<ClanInfo>({ description: '', discord: '', website: '' })
  const [loading, setLoading] = useState(true)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editMemberForm, setEditMemberForm] = useState<TeamMember | null>(null)
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)
  const [editingInfo, setEditingInfo] = useState(false)
  const [editInfoForm, setEditInfoForm] = useState<ClanInfo>({ description: '', discord: '', website: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [membersRes, infoRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-803a1733/team-members`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-803a1733/clan-info`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        })
      ])

      const membersData = await membersRes.json()
      const infoData = await infoRes.json()

      setMembers(membersData)
      setClanInfo(infoData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMember = async () => {
    if (!editMemberForm || !token) return

    try {
      const url = editingMemberId
        ? `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/team-members/${editingMemberId}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/team-members`

      const response = await fetch(url, {
        method: editingMemberId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editMemberForm),
      })

      if (response.ok) {
        await fetchData()
        setEditingMemberId(null)
        setEditMemberForm(null)
        setShowAddMemberForm(false)
      }
    } catch (error) {
      console.error('Failed to save member:', error)
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this member?')) return

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/team-members/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      await fetchData()
    } catch (error) {
      console.error('Failed to delete member:', error)
    }
  }

  const handleSaveInfo = async () => {
    if (!token) return

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-803a1733/clan-info`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editInfoForm),
        }
      )

      if (response.ok) {
        await fetchData()
        setEditingInfo(false)
      }
    } catch (error) {
      console.error('Failed to save clan info:', error)
    }
  }

  const startEditMember = (member: TeamMember) => {
    setEditingMemberId(member.id)
    setEditMemberForm({ ...member })
    setShowAddMemberForm(false)
  }

  const startAddMember = () => {
    setShowAddMemberForm(true)
    setEditMemberForm({
      id: '',
      name: '',
      role: '',
      description: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'
    })
    setEditingMemberId(null)
  }

  const startEditInfo = () => {
    setEditingInfo(true)
    setEditInfoForm({ ...clanInfo })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">Loading clan info...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-80 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(26, 21, 18, 0.75), rgba(26, 21, 18, 0.85)), url('https://images.unsplash.com/photo-1741151749309-8bb17563c701?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXN0JTIwZ2FtZSUyMGJhc2V8ZW58MXx8fHwxNzY0NjkwOTI3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-primary text-6xl mb-4">+46</div>
            <h1 className="text-foreground">Our Clan</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Clan Info Section */}
        <div className="bg-card/95 backdrop-blur-sm border border-border p-8 mb-12 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="text-primary" size={32} />
              <h2 className="text-foreground">About +46</h2>
            </div>
            {isLoggedIn && !editingInfo && (
              <button
                onClick={startEditInfo}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-all duration-200"
              >
                <Edit2 size={18} />
                Edit
              </button>
            )}
          </div>

          {editingInfo ? (
            <div className="space-y-4">
              <div>
                <label className="block text-foreground mb-2">Description</label>
                <textarea
                  value={editInfoForm.description}
                  onChange={(e) => setEditInfoForm({ ...editInfoForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                  placeholder="Describe your clan..."
                />
              </div>
              <div>
                <label className="block text-foreground mb-2">Discord Link</label>
                <input
                  type="text"
                  value={editInfoForm.discord}
                  onChange={(e) => setEditInfoForm({ ...editInfoForm, discord: e.target.value })}
                  className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                  placeholder="https://discord.gg/..."
                />
              </div>
              <div>
                <label className="block text-foreground mb-2">Website</label>
                <input
                  type="text"
                  value={editInfoForm.website}
                  onChange={(e) => setEditInfoForm({ ...editInfoForm, website: e.target.value })}
                  className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveInfo}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  onClick={() => setEditingInfo(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:opacity-90"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-foreground">
                {clanInfo.description || 'A competitive Rust clan dominating EU servers. Join us for intense PvP action and strategic gameplay.'}
              </p>
              {clanInfo.discord && (
                <div>
                  <span className="text-muted-foreground">Discord: </span>
                  <a href={clanInfo.discord} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {clanInfo.discord}
                  </a>
                </div>
              )}
              {clanInfo.website && (
                <div>
                  <span className="text-muted-foreground">Website: </span>
                  <a href={clanInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {clanInfo.website}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team Members Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Users className="text-primary" size={32} />
              <h2 className="text-foreground">Team Members</h2>
            </div>
            {isLoggedIn && (
              <button
                onClick={startAddMember}
                disabled={showAddMemberForm}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Plus size={20} />
                Add Member
              </button>
            )}
          </div>

          {/* Add Member Form */}
          {showAddMemberForm && editMemberForm && (
            <div className="bg-card/95 backdrop-blur-sm border border-primary/30 p-6 mb-8 rounded-2xl shadow-xl">
              <h3 className="text-foreground mb-4">Add New Member</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-foreground mb-2">Name</label>
                  <input
                    type="text"
                    value={editMemberForm.name}
                    onChange={(e) => setEditMemberForm({ ...editMemberForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-foreground mb-2">Role</label>
                  <input
                    type="text"
                    value={editMemberForm.role}
                    onChange={(e) => setEditMemberForm({ ...editMemberForm, role: e.target.value })}
                    placeholder="e.g., Leader, Scout, Builder"
                    className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-foreground mb-2">Description</label>
                  <textarea
                    value={editMemberForm.description}
                    onChange={(e) => setEditMemberForm({ ...editMemberForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-foreground mb-2">Avatar URL</label>
                  <input
                    type="text"
                    value={editMemberForm.avatar}
                    onChange={(e) => setEditMemberForm({ ...editMemberForm, avatar: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveMember}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowAddMemberForm(false)
                    setEditMemberForm(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:opacity-90"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div key={member.id} className="bg-card/95 backdrop-blur-sm border border-border hover:border-primary transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-primary/20">
                {editingMemberId === member.id && editMemberForm ? (
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-foreground mb-2">Name</label>
                        <input
                          type="text"
                          value={editMemberForm.name}
                          onChange={(e) => setEditMemberForm({ ...editMemberForm, name: e.target.value })}
                          className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-foreground mb-2">Role</label>
                        <input
                          type="text"
                          value={editMemberForm.role}
                          onChange={(e) => setEditMemberForm({ ...editMemberForm, role: e.target.value })}
                          className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-foreground mb-2">Description</label>
                        <textarea
                          value={editMemberForm.description}
                          onChange={(e) => setEditMemberForm({ ...editMemberForm, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-foreground mb-2">Avatar URL</label>
                        <input
                          type="text"
                          value={editMemberForm.avatar}
                          onChange={(e) => setEditMemberForm({ ...editMemberForm, avatar: e.target.value })}
                          className="w-full px-4 py-2 bg-input-background border border-border text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveMember}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90"
                        >
                          <Save size={18} />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingMemberId(null)
                            setEditMemberForm(null)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:opacity-90"
                        >
                          <X size={18} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                      />
                      <div>
                        <h3 className="text-foreground">{member.name}</h3>
                        <p className="text-primary">{member.role}</p>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{member.description}</p>

                    {isLoggedIn && (
                      <div className="flex gap-2 pt-4 border-t border-border">
                        <button
                          onClick={() => startEditMember(member)}
                          className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
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

          {members.length === 0 && (
            <div className="text-center py-12 bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-lg">
              <p className="text-muted-foreground">No team members yet</p>
              {isLoggedIn && (
                <p className="text-muted-foreground mt-2">Click "Add Member" to create one</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
