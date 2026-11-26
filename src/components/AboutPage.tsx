import type { ReactNode } from 'react'
import { Box, Divider, Stack, Typography } from '@mui/material'
import { RichText } from './RichText'

export function AboutPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack spacing={4} component="article" sx={{ maxWidth: 860, mx: 'auto' }}>
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      {children}
    </Stack>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack spacing={2} component="section">
      <Typography variant="h5" component="h2" color="primary">
        {title}
      </Typography>
      <Divider />
      {children}
    </Stack>
  )
}

/** Paragraph; `$…$` is typeset as math. */
export function P({ children }: { children: string }) {
  return (
    <Typography sx={{ lineHeight: 1.75 }}>
      <RichText>{children}</RichText>
    </Typography>
  )
}

export function Formulas({ items }: { items: string[] }) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'center', py: 1 }}>
      {items.map((f) => (
        <Typography key={f} component="div">
          <RichText>{f}</RichText>
        </Typography>
      ))}
    </Stack>
  )
}

export function List({ items }: { items: string[] }) {
  return (
    <Box component="ol" sx={{ m: 0, pl: 3, '& li': { mb: 0.5, lineHeight: 1.75 } }}>
      {items.map((item) => (
        <li key={item}>
          <RichText>{item}</RichText>
        </li>
      ))}
    </Box>
  )
}

/** Figure with caption. The screenshots come from the original app and are in Portuguese. */
export function Figure({ src, caption }: { src: string; caption: string }) {
  return (
    <Box component="figure" sx={{ m: 0, textAlign: 'center' }}>
      <Box
        component="img"
        src={src}
        alt={caption}
        loading="lazy"
        sx={{ maxWidth: '100%', height: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff' }}
      />
      <Typography component="figcaption" variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {caption}
      </Typography>
    </Box>
  )
}
