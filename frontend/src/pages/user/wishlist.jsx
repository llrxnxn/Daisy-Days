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
  Divider,
} from '@mui/material';
import { ShoppingCart, Trash2, Heart } from 'lucide-react';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[12],
  },
  borderRadius: theme.spacing(1.5),
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 280,
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[200],
  '&:hover img': {
    transform: 'scale(1.08)',
  },
  '& img': {
    transition: 'transform 0.4s ease-in-out',
  },
}));

const PriceTypography = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 700,
  color: '#ff6b6b',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const EmptyWishlistContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`,
  minHeight: '500px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

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
        <EmptyWishlistContainer elevation={0}>
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
              '&:hover': {
                boxShadow: '0 8px 16px rgba(255, 107, 107, 0.3)',
              },
            }}
          >
            Continue Shopping
          </Button>
        </EmptyWishlistContainer>
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
            '&:hover': {
              borderColor: '#ff5252',
              backgroundColor: 'rgba(255, 107, 107, 0.08)',
            },
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
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <StyledCard>
              <StyledCardMedia
                image={item.productId?.images?.[0]?.url || '/placeholder.jpg'}
                title={item.productId?.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Chip
                  label={item.productId?.category}
                  size="small"
                  sx={{
                    mb: 1,
                    background: 'linear-gradient(45deg, #ff6b6b 30%, #ff8787 90%)',
                    color: 'white',
                    fontWeight: 600,
                    height: 28,
                  }}
                />
                <Typography
                  gutterBottom
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.productId?.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#666',
                    lineHeight: 1.5,
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.productId?.description}
                </Typography>
                <PriceTypography>
                  ${item.productId?.price}
                </PriceTypography>
              </CardContent>
              <Divider />
              <CardActions sx={{ gap: 1, pt: 2, pb: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(45deg, #ff6b6b 30%, #ff8787 90%)',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '6px',
                    '&:hover': {
                      boxShadow: '0 6px 12px rgba(255, 107, 107, 0.3)',
                    },
                    '&:disabled': {
                      opacity: 0.6,
                    },
                  }}
                  onClick={() => handleAddToCart(item.productId?._id)}
                  disabled={addingToCart[item.productId?._id]}
                  startIcon={addingToCart[item.productId?._id] ? <CircularProgress size={20} color="inherit" /> : <ShoppingCart size={20} />}
                >
                  {addingToCart[item.productId?._id] ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    color: '#ff6b6b',
                    borderColor: '#ff6b6b',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '6px',
                    minWidth: '44px',
                    '&:hover': {
                      borderColor: '#ff5252',
                      backgroundColor: 'rgba(255, 107, 107, 0.08)',
                    },
                  }}
                  onClick={() => removeFromWishlist(item._id)}
                  title="Remove from wishlist"
                >
                  <Trash2 size={20} />
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
