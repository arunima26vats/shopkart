import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    contact?: string;
  };
  theme?: {
    color: string;
  };
  handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (
        event: string,
        handler: (response: { error?: { description?: string } }) => void
      ) => void;
    };
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, loading: cartLoading, refreshCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setShippingAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateAddress = (): string => {
    if (!shippingAddress.fullName.trim()) {
      return 'Full name is required.';
    }

    if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
      return 'Enter a valid 10-digit phone number.';
    }

    if (!shippingAddress.addressLine1.trim()) {
      return 'Address is required.';
    }

    if (!shippingAddress.city.trim()) {
      return 'City is required.';
    }

    if (!shippingAddress.state.trim()) {
      return 'State is required.';
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      return 'Enter a valid 6-digit pincode.';
    }

    return '';
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const validationError = validateAddress();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!window.Razorpay) {
      setError(
        'Razorpay Checkout has not loaded. Refresh the page and try again.'
      );
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Ask our backend to create both orders.
      const response = await api.post('/orders/create-payment-order', {
        shippingAddress,
      });

      const data = response.data;
      const order = data?.order;
      const razorpayOrder = data?.razorpayOrder;
      const keyId = data?.keyId;

      if (
        !data?.success ||
        !order?._id ||
        !razorpayOrder?.id ||
        !razorpayOrder?.amount ||
        !keyId
      ) {
        throw new Error('The server did not return complete payment details.');
      }

      // Step 2: Configure Razorpay using server-generated details.
      const options: RazorpayOptions = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'ShopKart',
        description: 'Payment for your ShopKart order',
        order_id: razorpayOrder.id,
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#171717',
        },

        // Step 3: Send Razorpay's response to our backend for verification.
        handler: async (paymentResponse) => {
          try {
            setError('');

            const verificationResponse = await api.post(
              '/orders/verify-payment',
              paymentResponse
            );

            if (
              !verificationResponse.data?.success ||
              !verificationResponse.data?.order
            ) {
              throw new Error('Payment verification was unsuccessful.');
            }

            const verifiedOrder = verificationResponse.data.order;

            if (
              verifiedOrder.paymentStatus !== 'PAID' ||
              verifiedOrder.status !== 'PLACED'
            ) {
              throw new Error(
                'The payment has not been confirmed by the server.'
              );
            }

            // The backend clears the database cart after verification.
            // Refresh the frontend cart to reflect that change.
            try {
              await refreshCart();
            } catch (refreshError) {
              console.error('CART REFRESH ERROR:', refreshError);
            }

            // Navigate only after the backend confirms payment.
            navigate('/order-confirmation', {
              replace: true,
              state: {
                order: verifiedOrder,
                paymentPending: false,
              },
            });
          } catch (verificationError: any) {
            console.error('PAYMENT VERIFICATION ERROR:', verificationError);

            setError(
              verificationError.response?.data?.message ||
                verificationError.message ||
                'We could not confirm your payment. Please check My Orders before retrying.'
            );
          } finally {
            setSubmitting(false);
          }
        },

        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setError(
              'Payment was cancelled or the checkout window was closed. Your order may still be pending payment.'
            );
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', (paymentFailure) => {
        setSubmitting(false);
        setError(
          paymentFailure.error?.description ||
            'Payment failed. Please try again.'
        );
      });

      // Step 4: Open the payment popup.
      razorpayInstance.open();
    } catch (err: any) {
      console.error('CHECKOUT ERROR:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to initialize payment. Please try again.'
      );

      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <main style={styles.page}>
        <p>Loading your cart...</p>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <h1>Your cart is empty</h1>
          <button style={styles.button} onClick={() => navigate('/products')}>
            Continue shopping
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.layout}>
        <section style={styles.card}>
          <h1>Checkout</h1>
          <p>Enter your shipping details to continue to secure payment.</p>

          {error && (
            <div role="alert" style={styles.error}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <h2>Shipping Address</h2>

            <label style={styles.label} htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              value={shippingAddress.fullName}
              onChange={handleChange}
              autoComplete="name"
              style={styles.input}
              required
            />

            <label style={styles.label} htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={shippingAddress.phone}
              onChange={handleChange}
              autoComplete="tel"
              style={styles.input}
              required
            />

            <label style={styles.label} htmlFor="addressLine1">
              Address
            </label>
            <input
              id="addressLine1"
              name="addressLine1"
              value={shippingAddress.addressLine1}
              onChange={handleChange}
              autoComplete="street-address"
              style={styles.input}
              required
            />

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label} htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleChange}
                  autoComplete="address-level2"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="state">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleChange}
                  autoComplete="address-level1"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <label style={styles.label} htmlFor="pincode">
              Pincode
            </label>
            <input
              id="pincode"
              name="pincode"
              inputMode="numeric"
              maxLength={6}
              value={shippingAddress.pincode}
              onChange={handleChange}
              autoComplete="postal-code"
              style={styles.input}
              required
            />

            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.button,
                opacity: submitting ? 0.65 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Preparing payment...' : 'Pay with Razorpay'}
            </button>
          </form>
        </section>

        <aside style={styles.card}>
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div key={item.product._id} style={styles.item}>
              <div>
                <strong>{item.product.name}</strong>
                <p style={styles.muted}>Quantity: {item.quantity}</p>
              </div>

              <strong>
                ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
              </strong>
            </div>
          ))}

          <div style={styles.total}>
            <span>Subtotal</span>
            <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
          </div>

          <p style={styles.muted}>
            Your final order amount is calculated by the server using current
            product prices.
          </p>
        </aside>
      </div>
    </main>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: '32px 20px',
    background: '#f5f5f5',
    color: '#171717',
  },

  layout: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
    gap: '24px',
    alignItems: 'start',
  },

  card: {
    background: '#fff',
    padding: '28px',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },

  label: {
    display: 'block',
    marginTop: '16px',
    marginBottom: '6px',
    fontWeight: 600,
  },

  input: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px',
    border: '1px solid #d4d4d4',
    borderRadius: '6px',
    fontSize: '15px',
  },

  row: {
    display: 'flex',
    gap: '16px',
  },

  field: {
    flex: 1,
    minWidth: 0,
  },

  button: {
    width: '100%',
    marginTop: '24px',
    padding: '13px',
    border: 0,
    borderRadius: '6px',
    background: '#171717',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },

  error: {
    padding: '12px',
    marginTop: '16px',
    borderRadius: '6px',
    background: '#fee2e2',
    color: '#991b1b',
  },

  item: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '14px 0',
    borderBottom: '1px solid #eee',
  },

  total: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
    fontSize: '18px',
  },

  muted: {
    color: '#737373',
    fontSize: '13px',
  },
};

export default Checkout;
