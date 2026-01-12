import { createTheme } from '@mui/material/styles';

/**
 * Custom theme for a distinct visual identity.
 * Requirements: React + MUI desktop UI.
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f6feb' },
    secondary: { main: '#7c3aed' },
    background: {
      default: '#f7f8fb',
      paper: '#ffffff',
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        },
      },
    },
  },
});

export default theme;
