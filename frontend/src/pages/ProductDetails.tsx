import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        setAddedToCart(false);

        const response = await api.get(`/products/${id}`);

        setProduct(response.data.product);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Unable to load this product.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={styles.center}>
        <p style={styles.message}>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={styles.center}>
        <p style={styles.error}>{error || 'Product not found.'}</p>

        <button
          type="button"
          onClick={() => navigate('/products')}
          style={styles.button}
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <button
        type="button"
        onClick={() => navigate('/products')}
        style={styles.backButton}
      >
        ← Back to Products
      </button>

      <main style={styles.card}>
        <div style={styles.imageContainer}>
          <img src={product.image} alt={product.name} style={styles.image} />
        </div>

        <div style={styles.info}>
          <p style={styles.category}>{product.category}</p>

          <h1 style={styles.title}>{product.name}</h1>

          <p style={styles.description}>{product.description}</p>

          <p style={styles.price}>₹{product.price}</p>

          <p
            style={{
              ...styles.stock,
              color: product.stock > 0 ? '#15803d' : '#dc2626',
            }}
          >
            {product.stock > 0
              ? `${product.stock} items in stock`
              : 'Out of stock'}
          </p>

          <button
            type="button"
            disabled={product.stock === 0}
            onClick={() => setAddedToCart(true)}
            style={{
              ...styles.cartButton,
              backgroundColor: addedToCart ? '#15803d' : '#2563eb',
              opacity: product.stock > 0 ? 1 : 0.6,
              cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            {addedToCart ? 'Added to Cart ✓' : 'Add to Cart'}
          </button>
        </div>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '40px',
  },

  backButton: {
    display: 'block',
    maxWidth: '1000px',
    margin: '0 auto 25px',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#374151',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '15px',
  },

  card: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
  },

  imageContainer: {
    minHeight: '450px',
  },

  image: {
    width: '100%',
    height: '100%',
    minHeight: '450px',
    objectFit: 'cover',
  },

  info: {
    padding: '50px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  category: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#2563eb',
    textTransform: 'uppercase',
    marginBottom: '10px',
  },

  title: {
    fontSize: '36px',
    color: '#111827',
    margin: '0 0 20px',
    lineHeight: 1.2,
  },

  description: {
    fontSize: '17px',
    lineHeight: 1.7,
    color: '#6b7280',
    margin: '0 0 10px',
  },

  price: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#111827',
    margin: '25px 0 10px',
  },

  stock: {
    fontSize: '16px',
    fontWeight: 600,
    margin: 0,
  },

  cartButton: {
    width: '100%',
    marginTop: '24px',
    padding: '14px 24px',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
  },

  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: '#f3f4f6',
  },

  message: {
    fontSize: '20px',
    color: '#374151',
  },

  error: {
    fontSize: '18px',
    color: '#dc2626',
  },

  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '15px',
  },
};

export default ProductDetails;
