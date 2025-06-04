import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase-client';

export default function EnvDebugBanner() {
  const [diag, setDiag] = useState<{url?: string; key?: string}>({});
  useEffect(() => {
    setDiag({
      url: import.meta.env.VITE_SUPABASE_URL || '❌ undefined',
      key: import.meta.env.VITE_SUPABASE_ANON_KEY
           ? import.meta.env.VITE_SUPABASE_ANON_KEY.slice(0,6) + '…'
           : '❌ undefined'
    });
  }, []);
  return (
    <div style={{background:'#fee',padding:'4px 8px',fontSize:'12px'}}>
      🔍 Supabase URL: {diag.url} | Anon Key: {diag.key}
    </div>
  );
}