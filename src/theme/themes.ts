import { createTheme, type ThemeOptions } from '@mui/material/styles'

export type ThemeKey = 'base' | 'branchBound' | 'transporte' | 'simplex'

const shared: ThemeOptions = {
  shape: { borderRadius: 8 },
  typography: { button: { textTransform: 'none', fontWeight: 600 } },
}

/** Base: blue primary, with green (success) and red (error) action buttons. */
const base = createTheme({
  ...shared,
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#2e7d32' }, // green
    success: { main: '#2e7d32' },
    error: { main: '#d32f2f' }, // red
  },
})

/** Branch and Bound: dark blue. */
const branchBound = createTheme({
  ...shared,
  palette: {
    primary: { main: '#0d2f6b' },
    secondary: { main: '#3f5fa8' },
  },
})

/** Transporte: yellow. */
const transporte = createTheme({
  ...shared,
  palette: {
    primary: { main: '#fbc02d', contrastText: '#1f1f1f' },
    secondary: { main: '#f57f17' },
  },
})

/** Simplex: green. */
const simplex = createTheme({
  ...shared,
  palette: {
    primary: { main: '#2e7d32' },
    secondary: { main: '#66bb6a', contrastText: '#1f1f1f' },
  },
})

export const themes: Record<ThemeKey, ReturnType<typeof createTheme>> = {
  base,
  branchBound,
  transporte,
  simplex,
}
