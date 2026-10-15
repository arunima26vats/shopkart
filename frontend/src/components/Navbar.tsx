import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

function Navbar() {
  const navigate = useNavigate();
  const [wishlistCount, setWishlistCount] = useState(0);

  // Global cart state
  const { totalItems } = useCart();

  // ======================================================
  // WISHLIST COUNT
  // ======================================================

  const fetchWishlistCount = async () => {
    try {
      const response = await api.get('/wishlist/count');
      setWishlistCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch wishlist count:', error);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    fetchWishlistCount();

    const handleWishlistUpdated = () => {
      fetchWishlistCount();
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdated);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdated);
    };
  }, []);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Unable to log out. Please try again.');
    }
  };

  // ======================================================
  // NAVIGATION
  // ======================================================

  const handleHome = () => navigate('/home');
  const handleProducts = () => navigate('/products');
  const handleWishlist = () => navigate('/wishlist');
  const handleCart = () => navigate('/cart');
  const handleOrders = () => navigate('/orders');
  const handleChangePassword = () => navigate('/change-password');

  // ======================================================
  // UI
  // ======================================================

  return (
    <nav style={styles.navbar}>
      <h2 style={styles.logo} onClick={handleHome}>
        ShopKart
      </h2>

      <div style={styles.actions}>
        <button type="button" onClick={handleHome} style={styles.homeButton}>
          Home
        </button>

        <button
          type="button"
          onClick={handleProducts}
          style={styles.productsButton}
        >
          Products
        </button>

        <button
          type="button"
          onClick={handleWishlist}
          style={styles.wishlistButton}
        >
          Wishlist ({wishlistCount})
        </button>

        <div style={styles.cartOrdersGroup}>
          <button type="button" onClick={handleCart} style={styles.cartButton}>
            Cart ({totalItems})
          </button>

          <button
            type="button"
            onClick={handleOrders}
            style={styles.ordersButton}
          >
            Orders
          </button>
        </div>

        <button
          type="button"
          onClick={handleChangePassword}
          style={styles.passwordButton}
        >
          Change Password
        </button>

        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

// ======================================================
// STYLES
// ======================================================

const buttonBase: React.CSSProperties = {
  padding: '10px 16px',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const styles: { [key: string]: React.CSSProperties } = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '16px 24px',
    background: '#111827',
    color: 'white',
  },

  logo: {
    margin: 0,
    fontSize: '24px',
    cursor: 'pointer',
    flexShrink: 0,
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: '10px',
  },

  homeButton: {
    ...buttonBase,
    background: '#374151',
  },

  productsButton: {
    ...buttonBase,
    background: '#2563eb',
  },

  wishlistButton: {
    ...buttonBase,
    background: '#db2777',
  },

  cartOrdersGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  cartButton: {
    ...buttonBase,
    background: '#059669',
  },

  ordersButton: {
    ...buttonBase,
    background: '#0f766e',
  },

  passwordButton: {
    ...buttonBase,
    background: '#7c3aed',
  },

  logoutButton: {
    ...buttonBase,
    background: '#dc2626',
  },
};

export default Navbar;
