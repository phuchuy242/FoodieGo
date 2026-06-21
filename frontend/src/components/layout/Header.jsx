import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

function Header() {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: '#ff6b35' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '24px',
            }}
            onClick={() => navigate('/')}
          >
            🍕 FoodieGo
          </Typography>

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body1" sx={{ color: 'white' }}>
                {user?.username}
              </Typography>
              <Button
                color="inherit"
                onClick={() => navigate('/menu')}
                sx={{ textTransform: 'none', fontSize: '16px' }}
              >
                Menu
              </Button>
              <Button
                color="inherit"
                onClick={handleLogout}
                variant="outlined"
                sx={{ textTransform: 'none', borderColor: 'white', color: 'white' }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none', fontSize: '16px' }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: 'white',
                  color: '#ff6b35',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Header
