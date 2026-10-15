import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useCart } from '../context/CartContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;

  // Wishlist props
  isSaved: boolean;
  wishlistLoading: boolean;
  wishlistError?: string;
  onWishlistToggle: () => void;
}

function ProductCard({
  product,
  onClick,
  isSaved,
  wishlistLoading,
  wishlistError,
  onWishlistToggle,
}: ProductCardProps) {
  // ======================================================
  // CART
  // ======================================================

  const { cartItems, addToCart } = useCart();

  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  // Find this product in the global cart
  const cartItem = cartItems.find((item) => item.product?._id === product._id);

  const cartQuantity = cartItem?.quantity || 0;

  // ======================================================
  // ADD TO CART
  // ======================================================

  const handleAddToCart = async () => {
    if (product.stock <= 0 || cartLoading) {
      return;
    }

    // Don't allow adding beyond stock
    if (cartQuantity >= product.stock) {
      setCartError(`Only ${product.stock} units available`);
      return;
    }

    try {
      setCartLoading(true);
      setCartError('');

      const success = await addToCart(product._id);

      if (!success) {
        // CartContext already stores the backend error.
        // Show a generic card-level error here.
        setCartError('Unable to add product to cart.');
      }
    } catch (error) {
      console.error('ADD TO CART ERROR:', error);

      setCartError('Unable to add product to cart.');
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      {/* Product Image */}
      <img src={product.image} alt={product.name} style={styles.image} />

      <div style={styles.content}>
        {/* Category */}
        <p style={styles.category}>{product.category}</p>

        {/* Product Name */}
        <h3 style={styles.name}>{product.name}</h3>

        {/* Description */}
        <p style={styles.description}>{product.description}</p>

        {/* Price + Stock */}
        <div style={styles.bottom}>
          <strong style={styles.price}>₹{product.price}</strong>

          <span
            style={{
              ...styles.stock,
              color: product.stock > 0 ? '#15803d' : '#dc2626',
            }}
          >
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        {/* ==================================================
            WISHLIST
        ================================================== */}

        <button
          type="button"
          onClick={onWishlistToggle}
          disabled={wishlistLoading}
          style={{
            ...styles.wishlistButton,
            ...(isSaved
              ? styles.savedWishlistButton
              : styles.addWishlistButton),
            opacity: wishlistLoading ? 0.7 : 1,
            cursor: wishlistLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {wishlistLoading
            ? 'Saving...'
            : isSaved
            ? '♥ Remove from Wishlist'
            : '♡ Add to Wishlist'}
        </button>

        {/* Wishlist Error */}
        {wishlistError && <p style={styles.error}>{wishlistError}</p>}

        {/* ==================================================
            ADD TO CART
        ================================================== */}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={
            product.stock <= 0 || cartLoading || cartQuantity >= product.stock
          }
          style={{
            ...styles.cartButton,
            ...(product.stock <= 0 || cartQuantity >= product.stock
              ? styles.disabledCartButton
              : {}),
            opacity: cartLoading ? 0.7 : 1,
            cursor:
              product.stock <= 0 || cartLoading || cartQuantity >= product.stock
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {cartLoading
            ? 'Adding...'
            : cartQuantity >= product.stock
            ? 'Maximum Stock Added'
            : cartQuantity > 0
            ? `Add Another (${cartQuantity} in Cart)`
            : 'Add to Cart'}
        </button>

        {/* Cart Error */}
        {cartError && <p style={styles.cartError}>{cartError}</p>}

        {/* ==================================================
            VIEW DETAILS
        ================================================== */}

        <button type="button" onClick={onClick} style={styles.button}>
          View Details
        </button>
      </div>
    </div>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles: Record<string, CSSProperties> = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },

  image: {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    display: 'block',
  },

  content: {
    padding: '20px',
  },

  category: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#2563eb',
    textTransform: 'uppercase',
    margin: '0 0 8px',
  },

  name: {
    fontSize: '20px',
    color: '#111827',
    margin: '0 0 8px',
  },

  description: {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: 1.5,
    minHeight: '42px',
    margin: 0,
  },

  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
  },

  price: {
    fontSize: '20px',
    color: '#111827',
  },

  stock: {
    fontSize: '13px',
    fontWeight: 600,
  },

  // ======================================================
  // WISHLIST STYLES
  // ======================================================

  wishlistButton: {
    width: '100%',
    marginTop: '18px',
    padding: '11px',
    border: 'none',
    borderRadius: '7px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
  },

  addWishlistButton: {
    backgroundColor: '#db2777',
  },

  savedWishlistButton: {
    backgroundColor: '#16a34a',
  },

  error: {
    margin: '8px 0 0',
    padding: '8px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    borderRadius: '5px',
    fontSize: '13px',
    textAlign: 'center',
  },

  // ======================================================
  // CART STYLES
  // ======================================================

  cartButton: {
    width: '100%',
    marginTop: '10px',
    padding: '11px',
    border: 'none',
    borderRadius: '7px',
    backgroundColor: '#059669',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
  },

  disabledCartButton: {
    backgroundColor: '#9ca3af',
  },

  cartError: {
    margin: '8px 0 0',
    padding: '8px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    borderRadius: '5px',
    fontSize: '13px',
    textAlign: 'center',
  },

  // ======================================================
  // DETAILS
  // ======================================================

  button: {
    width: '100%',
    marginTop: '10px',
    padding: '11px',
    border: 'none',
    borderRadius: '7px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default ProductCard;
