import { useCallback, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'

type Severity = 'success' | 'error' | 'warning' | 'info'

/** Tiny toast: `const [toast, notify] = useNotice()`; render `{toast}` once in the page. */
export function useNotice() {
  const [state, setState] = useState<{ text: string; severity: Severity } | null>(null)
  const notify = useCallback((text: string, severity: Severity = 'info') => setState({ text, severity }), [])
  const toast = (
    <Snackbar open={!!state} autoHideDuration={5000} onClose={() => setState(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert severity={state?.severity ?? 'info'} onClose={() => setState(null)} variant="filled">
        {state?.text}
      </Alert>
    </Snackbar>
  )
  return [toast, notify] as const
}
