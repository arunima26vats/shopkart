import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import OrderStatusProgress from '../components/OrderStatusProgress';

interface OrderItem {
  product: string | { _id: string };
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  status: 'PENDING_PAYMENT' | 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED';
  createdAt: string;
}

const money = (amount: number) => `₹${Number(amount).toLocaleString('en-IN')}`;

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/orders');

        if (active) {
          setOrders(
            Array.isArray(response.data.orders) ? response.data.orders : []
          );
        }
      } catch (err: unknown) {
        if (active) {
          const message =
            typeof err === 'object' && err !== null && 'response' in err
              ? (
                  err as {
                    response?: {
                      data?: { message?: string };
                    };
                  }
                ).response?.data?.message
              : undefined;

          setError(message || 'Unable to load your orders. Please try again.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, [retryCount]);

  const retryFetch = () => {
    setRetryCount((count) => count + 1);
  };

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.messageCard}>
          <p>Loading your orders...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={styles.page}>
        <div style={styles.content}>
          <h1>My Orders</h1>

          <section style={styles.card}>
            <p role="alert" style={styles.error}>
              {error}
            </p>

            <button style={styles.button} onClick={retryFetch}>
              Try again
            </button>

            <button
              style={styles.secondaryButton}
              onClick={() => navigate('/home')}
            >
              Back to home
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.content}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>My Orders</h1>
            <p style={styles.subtitle}>
              View your purchase history and track your orders.
            </p>
          </div>

          <button
            style={styles.secondaryButton}
            onClick={() => navigate('/products')}
          >
            Continue shopping
          </button>
        </header>

        {orders.length === 0 ? (
          <section style={styles.card}>
            <h2>No orders yet</h2>
            <p>You have not placed any orders yet.</p>

            <button style={styles.button} onClick={() => navigate('/products')}>
              Start shopping
            </button>
          </section>
        ) : (
          <div style={styles.list}>
            {orders.map((order) => (
              <article key={order._id} style={styles.card}>
                <div style={styles.orderHeader}>
                  <div style={styles.orderInfo}>
                    <h2 style={styles.orderTitle}>Order #{order._id}</h2>

                    <p style={styles.muted}>
                      Placed on{' '}
                      {new Date(order.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div style={styles.statuses}>
                    <span
                      style={{
                        ...styles.status,
                        ...getOrderStatusStyle(order.status),
                      }}
                    >
                      {order.status.replaceAll('_', ' ')}
                    </span>

                    <span
                      style={{
                        ...styles.payment,
                        ...(order.paymentStatus === 'PAID'
                          ? styles.paid
                          : order.paymentStatus === 'FAILED'
                          ? styles.failed
                          : styles.pending),
                      }}
                    >
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Bonus: visual order progress tracker */}
                <OrderStatusProgress status={order.status} />

                <div style={styles.items}>
                  <h3 style={styles.sectionTitle}>Items ordered</h3>

                  {(order.items || []).map((item, index) => (
                    <div key={`${order._id}-${index}`} style={styles.item}>
                      <div style={styles.itemInfo}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={styles.productImage}
                          />
                        ) : null}

                        <div>
                          <p style={styles.itemName}>{item.name}</p>
                          <p style={styles.muted}>Quantity: {item.quantity}</p>
                        </div>
                      </div>

                      <strong>{money(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>

                <div style={styles.footer}>
                  <div>
                    <span style={styles.muted}>Order total</span>
                    <h3 style={styles.total}>{money(order.totalAmount)}</h3>
                  </div>

                  <button
                    style={styles.button}
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    View details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

const getOrderStatusStyle = (status: Order['status']): CSSProperties => {
  switch (status) {
    case 'PLACED':
      return {
        background: '#dbeafe',
        color: '#1d4ed8',
      };
    case 'CONFIRMED':
      return {
        background: '#ede9fe',
        color: '#6d28d9',
      };
    case 'SHIPPED':
      return {
        background: '#ffedd5',
        color: '#c2410c',
      };
    case 'DELIVERED':
      return {
        background: '#dcfce7',
        color: '#166534',
      };
    default:
      return {
        background: '#fef3c7',
        color: '#92400e',
      };
  }
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: '32px 20px',
    background: '#f5f5f5',
    color: '#171717',
    boxSizing: 'border-box',
  },
  content: {
    maxWidth: 1000,
    margin: '0 auto',
  },
  messageCard: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: 24,
    background: '#ffffff',
    borderRadius: 12,
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  pageTitle: {
    margin: 0,
    fontSize: 30,
  },
  subtitle: {
    color: '#737373',
    marginTop: 8,
  },
  list: {
    display: 'grid',
    gap: 20,
  },
  card: {
    background: '#ffffff',
    padding: 24,
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
  orderHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  orderInfo: {
    minWidth: 0,
    flex: '1 1 240px',
  },
  orderTitle: {
    fontSize: 17,
    margin: 0,
    overflowWrap: 'anywhere',
  },
  statuses: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  status: {
    padding: '6px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },
  payment: {
    padding: '6px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },
  paid: {
    background: '#dcfce7',
    color: '#166534',
  },
  failed: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  pending: {
    background: '#fef3c7',
    color: '#92400e',
  },
  items: {
    marginTop: 20,
    borderTop: '1px solid #eeeeee',
  },
  sectionTitle: {
    fontSize: 15,
    margin: '16px 0 4px',
  },
  item: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    borderBottom: '1px solid #eeeeee',
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  productImage: {
    width: 52,
    height: 52,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #eeeeee',
  },
  itemName: {
    margin: 0,
    fontWeight: 600,
  },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  muted: {
    color: '#737373',
    fontSize: 13,
    overflowWrap: 'anywhere',
  },
  total: {
    margin: '6px 0 0',
    fontSize: 22,
  },
  button: {
    padding: '11px 16px',
    border: 0,
    borderRadius: 6,
    background: '#2563eb',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '11px 16px',
    border: '1px solid #d4d4d4',
    borderRadius: 6,
    background: '#ffffff',
    color: '#171717',
    cursor: 'pointer',
  },
  error: {
    color: '#b91c1c',
  },
};

export default Orders;
