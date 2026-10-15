import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    loading,
    error,
    subtotal,
    totalItems,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div style={styles.center}>
          <p>Loading cart...</p>
        </div>
      </>
    );
  }

  // ======================================================
  // EMPTY CART
  // ======================================================

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />

        <div style={styles.center}>
          <h1>Your Cart is Empty</h1>
          <p>Add some products to your cart to see them here.</p>

          <button
            type="button"
            style={styles.continueButton}
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      </>
    );
  }

  // ======================================================
  // CART
  // ======================================================

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <h1 style={styles.title}>Shopping Cart</h1>

        {error && (
          <div role="alert" style={styles.error}>
            {error}
          </div>
        )}

        <div style={styles.layout}>
          {/* CART ITEMS */}
          <div style={styles.itemsSection}>
            {cartItems.map((item) => (
              <div key={item.product._id} style={styles.cartItem}>
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  style={styles.image}
                />

                <div style={styles.itemInfo}>
                  <h2 style={styles.productName}>{item.product.name}</h2>

                  <p style={styles.category}>{item.product.category}</p>

                  <p style={styles.price}>₹{item.product.price.toFixed(2)}</p>

                  <p style={styles.stock}>
                    Stock available: {item.product.stock}
                  </p>

                  {/* QUANTITY CONTROLS */}
                  <div style={styles.quantityRow}>
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.product.name}`}
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      style={{
                        ...styles.quantityButton,
                        opacity: item.quantity <= 1 ? 0.5 : 1,
                      }}
                    >
                      −
                    </button>

                    <span style={styles.quantity}>{item.quantity}</span>

                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.product.name}`}
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stock}
                      style={{
                        ...styles.quantityButton,
                        opacity: item.quantity >= item.product.stock ? 0.5 : 1,
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* REMOVE */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product._id)}
                    style={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>

                {/* ITEM TOTAL */}
                <div style={styles.itemTotal}>
                  ₹{(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <aside style={styles.summary}>
            <h2>Order Summary</h2>

            <div style={styles.summaryRow}>
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <hr />

            <div style={styles.totalRow}>
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            {/* NAVIGATE TO CHECKOUT */}
            <button
              type="button"
              style={styles.checkoutButton}
              onClick={() => navigate('/checkout')}
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
          </aside>
        </div>
      </div>
    </>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles: {
  [key: string]: React.CSSProperties;
} = {
  page: {
    minHeight: '100vh',
    background: '#f3f4f6',
    padding: '40px',
    boxSizing: 'border-box',
  },

  title: {
    marginBottom: '30px',
    color: '#111827',
  },

  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 350px',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    alignItems: 'start',
  },

  itemsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minWidth: 0,
  },

  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    background: '#ffffff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },

  image: {
    width: '140px',
    height: '140px',
    objectFit: 'cover',
    borderRadius: '8px',
    flexShrink: 0,
  },

  itemInfo: {
    flex: 1,
    minWidth: 0,
  },

  productName: {
    margin: '0 0 8px',
    color: '#111827',
  },

  category: {
    color: '#6b7280',
    margin: '4px 0',
  },

  price: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#2563eb',
    margin: '8px 0',
  },

  stock: {
    color: '#6b7280',
    fontSize: '14px',
  },

  quantityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '12px',
  },

  quantityButton: {
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '6px',
    background: '#2563eb',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
  },

  quantity: {
    minWidth: '30px',
    textAlign: 'center',
    fontWeight: 600,
  },

  removeButton: {
    marginTop: '12px',
    padding: '8px 14px',
    border: 'none',
    borderRadius: '6px',
    background: '#dc2626',
    color: 'white',
    cursor: 'pointer',
  },

  itemTotal: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
    whiteSpace: 'nowrap',
  },

  summary: {
    background: '#ffffff',
    padding: '25px',
    borderRadius: '10px',
    height: 'fit-content',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },

  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    margin: '18px 0',
    color: '#374151',
  },

  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: '20px',
    fontSize: '20px',
    fontWeight: 700,
  },

  checkoutButton: {
    width: '100%',
    marginTop: '25px',
    padding: '13px',
    border: 'none',
    borderRadius: '6px',
    background: '#059669',
    color: 'white',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  },

  continueButton: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    background: '#2563eb',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
  },

  center: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#374151',
    padding: '20px',
  },

  error: {
    maxWidth: '1200px',
    margin: '0 auto 20px',
    padding: '12px',
    borderRadius: '6px',
    background: '#fee2e2',
    color: '#dc2626',
  },
};

export default Cart;
