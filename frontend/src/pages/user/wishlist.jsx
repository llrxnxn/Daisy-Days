import React, { useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import axios from '../../api/axios';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Rating,
} from '@mui/material';
import { ShoppingCart, Heart, Trash2 } from 'lucide-react';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
  borderRadius: '12px',
  overflow: 'hidden',
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 280,
  position: 'relative',
  backgroundColor: theme.palette.grey[100],
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const BadgeContainer = styled(Box)({
  position: 'absolute',
  top: 12,
  left: 12,
  zIndex: 10,
});

const WishlistBadge = styled(Box)({
  position: 'absolute',
  top: 12,
  right: 12,
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 10,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
});

const WishlistPage = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const [addingToCart, setAddingToCart] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const authToken = localStorage.getItem('authToken');

  const handleAddToCart = async (productId) => {
    try {
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      
      await axios.post(
        '/cart',
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setSuccessMessage('Product added to cart!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setSuccessMessage(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (wishlist.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper
          sx={{
            padding: 6,
            textAlign: 'center',
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          elevation={0}
        >
          <Heart size={80} style={{ color: '#ff6b6b', marginBottom: 24, opacity: 0.8 }} />
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1, color: '#333' }}>
            Your Wishlist is Empty
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
            Add some beautiful flowers to your wishlist!
          </Typography>
          <Button
            href="/shop"
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #ff6b6b 30%, #ff8787 90%)',
              color: 'white',
              fontWeight: 600,
              padding: '12px 32px',
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: '8px',
            }}
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Heart size={32} style={{ color: '#ff6b6b' }} />
            My Wishlist
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
          </Typography>
        </Box>
        <Button
          href="/shop"
          variant="outlined"
          sx={{
            color: '#ff6b6b',
            borderColor: '#ff6b6b',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '6px',
            padding: '8px 24px',
          }}
        >
          Back to Shop
        </Button>
      </Box>

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: '8px' }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {wishlist.map(item => (
          <Grid key={item._id} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' } }}>
            <StyledCard>
              <Box sx={{ position: 'relative' }}>
                <StyledCardMedia
                  image={item.productId?.images?.[0]?.url || '/placeholder.jpg'}
                  title={item.productId?.name}
                />
                <BadgeContainer>
                  <Chip
                    label="In Stock"
                    sx={{
                      background: '#e8f5e9',
                      color: '#2e7d32',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </BadgeContainer>
                <WishlistBadge onClick={() => removeFromWishlist(item._id)}>
                  <Heart size={20} fill="#ff6b6b" color="#ff6b6b" />
                </WishlistBadge>
              </Box>

              <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#fff',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    display: 'inline-block',
                    background: '#ff6b6b',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    mb: 1.5,
                  }}
                >
                  {item.productId?.category}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#333',
                    fontSize: '1.05rem',
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.3,
                  }}
                >
                  {item.productId?.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#666',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    mb: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.productId?.description}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#ff6b6b',
                  }}
                >
                  ₱{item.productId?.price}
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 1, gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    background: '#ff6b6b',
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '8px',
                    py: 1.3,
                    fontSize: '0.95rem',
                    '&:hover': {
                      background: '#ff5252',
                    },
                    '&:disabled': {
                      opacity: 0.6,
                    },
                  }}
                  onClick={() => handleAddToCart(item.productId?._id)}
                  disabled={addingToCart[item.productId?._id]}
                  startIcon={addingToCart[item.productId?._id] ? <CircularProgress size={18} color="inherit" /> : <ShoppingCart size={18} />}
                >
                  {addingToCart[item.productId?._id] ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    color: '#ff6b6b',
                    borderColor: '#ff6b6b',
                    borderRadius: '8px',
                    minWidth: '44px',
                    p: 1.3,
                    '&:hover': {
                      borderColor: '#ff5252',
                      backgroundColor: 'rgba(255, 107, 107, 0.08)',
                    },
                  }}
                  onClick={() => removeFromWishlist(item._id)}
                  title="Remove from wishlist"
                >
                  <Trash2 size={18} />
                </Button>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default WishlistPage;