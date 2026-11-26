import { Link as RouterLink } from '@tanstack/react-router'
import { Box, Container, Link, Stack, Typography } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import { useTranslation } from 'react-i18next'
import { reopenConsent } from '../lib/analytics'

export const REPO_URL = 'https://github.com/jmmccota/Otimizacao'

export function Footer() {
  const { t } = useTranslation()
  return (
    <Box component="footer" sx={{ mt: 6, py: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Container>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
          <Typography variant="body2" color="text.secondary">
            {t('footer.project')}
          </Typography>
          <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Link component={RouterLink} to="/about" underline="hover">
              {t('footer.about')}
            </Link>
            <Link component={RouterLink} to="/privacy" underline="hover">
              {t('footer.privacy')}
            </Link>
            <Link component={RouterLink} to="/contact" underline="hover">
              {t('footer.contact')}
            </Link>
            <Link component="button" type="button" onClick={reopenConsent} underline="hover">
              {t('footer.analytics')}
            </Link>
            <Link href={REPO_URL} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <GitHubIcon fontSize="small" aria-hidden />
              {t('footer.source')}
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
