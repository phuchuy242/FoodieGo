import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import axiosClient from '../api/axiosClient'

function Menu() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchFoods()
  }, [category])

  const fetchFoods = async () => {
    try {
      setLoading(true)
      setError('')
      const params = category ? { category } : {}
      const response = await axiosClient.get('/foods/', { params })
      setFoods(response.data.results || response.data)
    } catch (err) {
      setError('Failed to load foods')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (foodId) => {
    alert(`Added food #${foodId} to cart!`)
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 4, fontWeight: 'bold' }}>
        📋 Food Menu
      </Typography>

      {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}

      <Box sx={{ marginBottom: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="appetizer">Appetizer</MenuItem>
            <MenuItem value="main_course">Main Course</MenuItem>
            <MenuItem value="dessert">Dessert</MenuItem>
            <MenuItem value="beverage">Beverage</MenuItem>
            <MenuItem value="soup">Soup</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {foods.length === 0 ? (
        <Alert severity="info">No foods available</Alert>
      ) : (
        <Grid container spacing={3}>
          {foods.map((food) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={food.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={food.image || 'https://via.placeholder.com/300x200?text=Food'}
                  alt={food.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                    {food.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ marginBottom: 2, minHeight: '40px' }}
                  >
                    {food.description}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ff6b35', fontWeight: 'bold', marginBottom: 1 }}>
                    Category: {food.category}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                      ${parseFloat(food.price).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" sx={{ backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
                      {food.preparation_time} mins
                    </Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      backgroundColor: '#ff6b35',
                      textTransform: 'none',
                      fontWeight: 'bold',
                    }}
                    onClick={() => handleAddToCart(food.id)}
                    disabled={!food.is_available}
                  >
                    {food.is_available ? 'Add to Cart' : 'Unavailable'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default Menu
