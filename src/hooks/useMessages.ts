import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useMessages(agentId?: string) {
  const [msgs, setMsgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // initial fetch
  useEffect(() => {
    if (!agentId) return
    ;(async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: true })
      if (!error) setMsgs(data ?? [])
      setLoading(false)
    })()
  }, [agentId])

  // realtime listener
  useEffect(() => {
    if (!agentId) return
    const chan = supabase
      .channel('messages-rt')
      .on(
        'postgres_changes',
        { event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `agent_id=eq.${agentId}` },
        payload => setMsgs(m => [...m, payload.new])
      )
      .subscribe()
    return () => { supabase.removeChannel(chan) }
  }, [agentId])

  const send = async (role:'user'|'assistant', content:string) =>
    supabase.from('messages').insert({ agent_id: agentId, user_id: null, role, content })

  return { msgs, loading, send }
}