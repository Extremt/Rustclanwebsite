import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors())
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

// Helper function to hash passwords (simple implementation)
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Initialize admin user if not exists
async function initializeAdmin() {
  const existingAdmin = await kv.get('admin:credentials')
  if (!existingAdmin) {
    const defaultPasswordHash = await hashPassword('admin123')
    await kv.set('admin:credentials', {
      username: 'admin',
      passwordHash: defaultPasswordHash
    })
  }
}

initializeAdmin()

// ========== AUTH ROUTES ==========

app.post('/make-server-803a1733/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    const credentials = await kv.get('admin:credentials')
    if (!credentials) {
      return c.json({ error: 'Admin not configured' }, 500)
    }

    const passwordHash = await hashPassword(password)
    
    if (credentials.username === username && credentials.passwordHash === passwordHash) {
      // Generate a simple token (in production, use proper JWT)
      const token = btoa(`${username}:${Date.now()}`)
      return c.json({ success: true, token, username })
    }

    return c.json({ error: 'Invalid credentials' }, 401)
  } catch (error) {
    console.log(`Login error: ${error}`)
    return c.json({ error: `Login failed: ${error.message}` }, 500)
  }
})

app.post('/make-server-803a1733/verify-token', async (c) => {
  try {
    const { token } = await c.req.json()
    if (!token) {
      return c.json({ valid: false }, 401)
    }
    
    // Simple token validation
    try {
      atob(token)
      return c.json({ valid: true })
    } catch {
      return c.json({ valid: false }, 401)
    }
  } catch (error) {
    console.log(`Token verification error: ${error}`)
    return c.json({ error: `Verification failed: ${error.message}` }, 500)
  }
})

// ========== WIPES ROUTES ==========

app.get('/make-server-803a1733/wipes', async (c) => {
  try {
    const wipes = await kv.getByPrefix('wipe:')
    return c.json(wipes || [])
  } catch (error) {
    console.log(`Get wipes error: ${error}`)
    return c.json({ error: `Failed to fetch wipes: ${error.message}` }, 500)
  }
})

app.post('/make-server-803a1733/wipes', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1]
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const wipe = await c.req.json()
    const id = wipe.id || crypto.randomUUID()
    await kv.set(`wipe:${id}`, { ...wipe, id })
    return c.json({ success: true, id })
  } catch (error) {
    console.log(`Create wipe error: ${error}`)
    return c.json({ error: `Failed to create wipe: ${error.message}` }, 500)
  }
})

app.put('/make-server-803a1733/wipes/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1]
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const id = c.req.param('id')
    const wipe = await c.req.json()
    await kv.set(`wipe:${id}`, { ...wipe, id })
    return c.json({ success: true })
  } catch (error) {
    console.log(`Update wipe error: ${error}`)
    return c.json({ error: `Failed to update wipe: ${error.message}` }, 500)
  }
})

app.delete('/make-server-803a1733/wipes/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1]
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const id = c.req.param('id')
    await kv.del(`wipe:${id}`)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Delete wipe error: ${error}`)
    return c.json({ error: `Failed to delete wipe: ${error.message}` }, 500)
  }
})

// ========== TEAM MEMBERS ROUTES ==========

app.get('/make-server-803a1733/team-members', async (c) => {
  try {
    const members = await kv.getByPrefix('team:')
    return c.json(members || [])
  } catch (error) {
    console.log(`Get team members error: ${error}`)
    return c.json({ error: `Failed to fetch team members: ${error.message}` }, 500)
  }
})

app.post('/make-server-803a1733/team-members', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1]
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const member = await c.req.json()
    const id = member.id || crypto.randomUUID()
    await kv.set(`team:${id}`, { ...member, id })
    return c.json({ success: true, id })
  } catch (error) {
    console.log(`Create team member error: ${error}`)
    return c.json({ error: `Failed to create team member: ${error.message}` }, 500)
  }
})

app.put('/make-server-803a1733/team-members/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1]
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const id = c.req.param('id')
    const member = await c.req.json()
    await kv.set(`team:${id}`, { ...member, id })
    return c.json({ success: true })
  } catch (error) {
    console.log(`Update team member error: ${error}`)
    return c.json({ error: `Failed to update team member: ${error.message}` }, 500)
  }
})

app.delete('/make-server-803a1733/team-members/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1]
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const id = c.req.param('id')
    await kv.del(`team:${id}`)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Delete team member error: ${error}`)
    return c.json({ error: `Failed to delete team member: ${error.message}` }, 500)
  }
})

// ========== VIDEOS ROUTES ==========

app.get('/make-server-803a1733/videos', async (c) => {
  try {
    const videos = await kv.getByPrefix('video:')
    return c.json(videos || [])
  } catch (error) {
    console.log(`Get videos error: ${error}`)
    return c.json({ error: `Failed to fetch videos: ${error.message}` }, 500)
  }
})

app.post('/make-server-803a1733/videos', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1]
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const video = await c.req.json()
    const id = video.id || crypto.randomUUID()
    await kv.set(`video:${id}`, { ...video, id, uploadedAt: new Date().toISOString() })
    return c.json({ success: true, id })
  } catch (error) {
    console.log(`Create video error: ${error}`)
    return c.json({ error: `Failed to create video: ${error.message}` }, 500)
  }
})

app.put('/make-server-803a1733/videos/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1]
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const id = c.req.param('id')
    const video = await c.req.json()
    const existing = await kv.get(`video:${id}`)
    await kv.set(`video:${id}`, { ...video, id, uploadedAt: existing?.uploadedAt || new Date().toISOString() })
    return c.json({ success: true })
  } catch (error) {
    console.log(`Update video error: ${error}`)
    return c.json({ error: `Failed to update video: ${error.message}` }, 500)
  }
})

app.delete('/make-server-803a1733/videos/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1]
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const id = c.req.param('id')
    await kv.del(`video:${id}`)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Delete video error: ${error}`)
    return c.json({ error: `Failed to delete video: ${error.message}` }, 500)
  }
})

// ========== CLAN INFO ROUTES ==========

app.get('/make-server-803a1733/clan-info', async (c) => {
  try {
    const info = await kv.get('clan:info')
    return c.json(info || { description: '', discord: '', website: '' })
  } catch (error) {
    console.log(`Get clan info error: ${error}`)
    return c.json({ error: `Failed to fetch clan info: ${error.message}` }, 500)
  }
})

app.put('/make-server-803a1733/clan-info', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1]
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const info = await c.req.json()
    await kv.set('clan:info', info)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Update clan info error: ${error}`)
    return c.json({ error: `Failed to update clan info: ${error.message}` }, 500)
  }
})

Deno.serve(app.fetch)
