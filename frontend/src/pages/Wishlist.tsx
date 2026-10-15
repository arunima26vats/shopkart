import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import api from '../services/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ======================================================
  // FETCH WISHLIST
  // ======================================================
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/wishlist');

      setWishlist(response.data.wishlist || []);
    } catch (err: any) {
      console.error('Failed to fetch wishlist:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load wishlist. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================
  useEffect(() => {
    fetchWishlist();
  }, []);

  // ======================================================
  // REMOVE FROM WISHLIST
  // ======================================================
  const handleRemove = async (productId: string) => {
    try {
      await api.delete(`/wishlist/${productId}`);

      // Remove immediately from UI
      setWishlist((currentWishlist) =>
        currentWishlist.filter((product) => product._id !== productId)
      );

      // Tell Navbar to update wishlist count
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err: any) {
      console.error('Failed to remove from wishlist:', err);

      alert(
        err.response?.data?.message || 'Unable to remove product from wishlist.'
      );
    }
  };

  // ======================================================
  // LOADING STATE
  // ======================================================
  if (loading) {
    return (
      <>
        <Navbar />

        <div style={styles.page}>
          <div style={styles.center}>
            <p style={styles.message}>Loading wishlist...</p>
          </div>
        </div>
      </>
    );
  }

  // ======================================================
  // ERROR STATE
  // ======================================================
  if (error) {
    return (
      <>
        <Navbar />

        <div style={styles.page}>
          <div style={styles.center}>
            <p style={styles.error}>{error}</p>

            <button
              type="button"
              onClick={fetchWishlist}
              style={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  // ======================================================
  // EMPTY STATE
  // ======================================================
  if (wishlist.length === 0) {
    return (
      <>
        <Navbar />

        <div style={styles.page}>
          <div style={styles.header}>
            <h1 style={styles.title}>My Wishlist</h1>

            <p style={styles.subtitle}>0 products saved</p>
          </div>

          <div style={styles.empty}>
            <div style={styles.emptyIcon}>♡</div>

            <h2 style={styles.emptyTitle}>Your wishlist is empty</h2>

            <p style={styles.emptyText}>
              You haven't added any products to your wishlist yet.
            </p>

            <button
              type="button"
              onClick={() => navigate('/products')}
              style={styles.browseButton}
            >
              Browse Products
            </button>
          </div>
        </div>
      </>
    );
  }

  // ======================================================
  // WISHLIST PAGE
  // ======================================================
  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>My Wishlist</h1>

            <p style={styles.subtitle}>
              {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'}{' '}
              saved
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/products')}
            style={styles.browseButton}
          >
            Browse Products
          </button>
        </header>

        <main style={styles.grid}>
          {wishlist.map((product) => (
            <article key={product._id} style={styles.card}>
              {/* Product Image */}
              <img
                src={product.image}
                alt={product.name}
                style={styles.image}
              />

              <div style={styles.cardContent}>
                {/* Category */}
                <span style={styles.category}>{product.category}</span>

                {/* Name */}
                <h2 style={styles.productName}>{product.name}</h2>

                {/* Description */}
                <p style={styles.description}>{product.description}</p>

                {/* Price */}
                <p style={styles.price}>₹{product.price}</p>

                {/* Stock */}
                <p
                  style={{
                    ...styles.stock,
                    color: product.stock > 0 ? '#15803d' : '#dc2626',
                  }}
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : 'Out of stock'}
                </p>

                {/* Buttons */}
                <div style={styles.buttonContainer}>
                  <button
                    type="button"
                    onClick={() => navigate(`/products/${product._id}`)}
                    style={styles.detailsButton}
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(product._id)}
                    style={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </main>
      </div>
    </>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles: {
  [key: string]: CSSProperties;
} = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '40px',
  },

  header: {
    maxWidth: '1200px',
    margin: '0 auto 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },

  title: {
    margin: 0,
    fontSize: '42px',
    color: '#111827',
  },

  subtitle: {
    marginTop: '8px',
    marginBottom: 0,
    fontSize: '18px',
    color: '#6b7280',
  },

  browseButton: {
    padding: '14px 26px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '17px',
    fontWeight: 600,
  },

  grid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },

  image: {
    width: '100%',
    height: '285px',
    objectFit: 'cover',
    display: 'block',
  },

  cardContent: {
    padding: '26px',
    textAlign: 'center',
  },

  category: {
    display: 'inline-block',
    padding: '7px 14px',
    borderRadius: '6px',
    backgroundColor: '#e0e7ff',
    color: '#1d4ed8',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '14px',
  },

  productName: {
    margin: '0 0 12px',
    fontSize: '26px',
    color: '#111827',
  },

  description: {
    margin: '0 auto 18px',
    maxWidth: '450px',
    fontSize: '16px',
    lineHeight: 1.5,
    color: '#6b7280',
  },

  price: {
    margin: '10px 0',
    fontSize: '26px',
    fontWeight: 700,
    color: '#111827',
  },

  stock: {
    margin: '8px 0 22px',
    fontSize: '17px',
    fontWeight: 600,
  },

  buttonContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },

  detailsButton: {
    flex: 1,
    padding: '13px 16px',
    border: 'none',
    borderRadius: '7px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
  },

  removeButton: {
    flex: 1,
    padding: '13px 16px',
    border: 'none',
    borderRadius: '7px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
  },

  center: {
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  message: {
    fontSize: '20px',
    color: '#374151',
  },

  error: {
    fontSize: '18px',
    color: '#dc2626',
    marginBottom: '16px',
  },

  retryButton: {
    padding: '11px 22px',
    border: 'none',
    borderRadius: '7px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
  },

  empty: {
    maxWidth: '650px',
    margin: '80px auto',
    padding: '55px 40px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
  },

  emptyIcon: {
    fontSize: '64px',
    color: '#9ca3af',
    marginBottom: '10px',
  },

  emptyTitle: {
    margin: '0 0 12px',
    fontSize: '28px',
    color: '#111827',
  },

  emptyText: {
    margin: '0 auto 25px',
    fontSize: '17px',
    color: '#6b7280',
    lineHeight: 1.5,
  },
};

export default Wishlist;
