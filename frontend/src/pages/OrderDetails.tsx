import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

interface OrderItem {
  product: string | { _id: string };
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

const money = (amount: number) => `₹${Number(amount).toLocaleString('en-IN')}`;

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError('');

        if (!id) {
          throw new Error('Order ID is missing.');
        }

        const response = await api.get(`/orders/${id}`);

        if (active) {
          setOrder(response.data.order);
        }
      } catch (err: any) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Unable to load order details.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main style={styles.page}>
        <p>Loading order details...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <h1>Unable to load order</h1>
          <p role="alert" style={styles.error}>
            {error || 'Order not found.'}
          </p>
          <button style={styles.button} onClick={() => navigate('/orders')}>
            Back to My Orders
          </button>
        </section>
      </main>
    );
  }

  const address = order.shippingAddress;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate('/orders')}>
          ← Back to My Orders
        </button>

        <section style={styles.card}>
          <div style={styles.heading}>
            <div>
              <h1>Order Details</h1>
              <p style={styles.muted}>Order #{order._id}</p>
              <p style={styles.muted}>
                Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
            <span style={styles.status}>{order.status}</span>
          </div>

          <div style={styles.statusRow}>
            <span style={styles.label}>Payment status</span>
            <strong
              style={{
                color:
                  order.paymentStatus === 'PAID'
                    ? '#15803d'
                    : order.paymentStatus === 'FAILED'
                    ? '#b91c1c'
                    : '#92400e',
              }}
            >
              {order.paymentStatus}
            </strong>
          </div>

          <h2>Items purchased</h2>

          {order.items?.map((item, index) => (
            <div key={`${order._id}-${index}`} style={styles.item}>
              <div>
                <strong>{item.name}</strong>
                <p style={styles.muted}>
                  {money(item.price)} × {item.quantity}
                </p>
              </div>
              <strong>{money(item.price * item.quantity)}</strong>
            </div>
          ))}

          <div style={styles.total}>
            <span>Total amount</span>
            <strong>{money(order.totalAmount)}</strong>
          </div>
        </section>

        <section style={styles.card}>
          <h2>Shipping address</h2>

          {address ? (
            <div style={styles.address}>
              <strong>{address.fullName || '—'}</strong>
              <p>{address.addressLine1 || '—'}</p>
              <p>
                {[address.city, address.state, address.pincode]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </p>
              <p>Phone: {address.phone || '—'}</p>
            </div>
          ) : (
            <p style={styles.muted}>
              No shipping address was saved for this order.
            </p>
          )}
        </section>

        <button style={styles.button} onClick={() => navigate('/products')}>
          Continue shopping
        </button>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: '32px 20px',
    background: '#f5f5f5',
    color: '#171717',
  },
  container: {
    maxWidth: 850,
    margin: '0 auto',
    display: 'grid',
    gap: 20,
  },
  card: {
    background: '#fff',
    color: '#171717',
    padding: 28,
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  heading: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  status: {
    padding: '8px 12px',
    borderRadius: 20,
    background: '#dbeafe',
    color: '#1d4ed8',
    fontWeight: 700,
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    padding: '16px 0',
    borderTop: '1px solid #eee',
    borderBottom: '1px solid #eee',
    marginBottom: 24,
  },
  label: { color: '#525252' },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    padding: '16px 0',
    borderBottom: '1px solid #eee',
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 20,
    fontSize: 19,
  },
  address: {
    padding: 16,
    background: '#f9fafb',
    borderRadius: 8,
    lineHeight: 1.6,
  },
  muted: { color: '#737373', fontSize: 14 },
  error: { color: '#b91c1c' },
  backButton: {
    justifySelf: 'start',
    border: 0,
    background: 'transparent',
    color: '#2563eb',
    cursor: 'pointer',
    fontSize: 15,
  },
  button: {
    padding: '13px 18px',
    border: 0,
    borderRadius: 6,
    background: '#2563eb',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
