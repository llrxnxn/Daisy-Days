import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { IconButton, Tooltip } from '@mui/material';
import { Heart } from 'lucide-react';
import { styled } from '@mui/material/styles';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: 'relative',
  width: 44,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    transform: 'scale(1.1)',
  },
  '&.active': {
    color: '#ff6b6b',
  },
}));

const WishlistButton = ({ productId, className = '' }) => {
  const { isInWishlist, addToWishlist, removeFromWishlistByProductId, loading } = useWishlist();
  const inWishlist = isInWishlist(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (inWishlist) {
        await removeFromWishlistByProductId(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error('Wishlist action failed:', error);
    }
  };

  return (
    <Tooltip title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
      <StyledIconButton
        onClick={handleClick}
        disabled={loading}
        className={`${inWishlist ? 'active' : ''} ${className}`}
        size="small"
      >
        <Heart
          size={24}
          fill={inWishlist ? '#ff6b6b' : 'none'}
          stroke={inWishlist ? '#ff6b6b' : '#999'}
          style={{ transition: 'all 0.3s ease' }}
        />
      </StyledIconButton>
    </Tooltip>
  );
};

export default WishlistButton;
