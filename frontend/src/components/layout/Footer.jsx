import React from 'react'
import { Box, Container, Typography, Link } from '@mui/material'

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#333333',
        color: 'white',
        padding: '40px 0',
        marginTop: '60px',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" sx={{ textAlign: 'center', marginBottom: '10px' }}>
          © 2026 FoodieGo. All rights reserved.
        </Typography>
        <Box sx={{ textAlign: 'center', display: 'flex', gap: 3, justifyContent: 'center' }}>
          <Link href="#" color="inherit" underline="hover">
            About Us
          </Link>
          <Link href="#" color="inherit" underline="hover">
            Privacy Policy
          </Link>
          <Link href="#" color="inherit" underline="hover">
            Terms of Service
          </Link>
          <Link href="#" color="inherit" underline="hover">
            Contact Us
          </Link>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
