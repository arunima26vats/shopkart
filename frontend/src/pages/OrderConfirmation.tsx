import { useLocation, useNavigate } from 'react-router-dom';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  status: string;
  razorpayPaymentId?: string;
}

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order as Order | undefined;

  if (!order || order.paymentStatus !== 'PAID') {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <h1>Order confirmation unavailable</h1>
          <p>
            We couldn't find a verified order in this page's navigation data.
            Check My Orders before attempting another payment.
          </p>
          <button onClick={() => navigate('/products')} style={styles.button}>
            Continue shopping
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.check}>✓</div>
        <h1>Payment successful!</h1>
        <p>Your ShopKart order has been placed successfully.</p>

        <div style={styles.details}>
          <p>
            <strong>Order ID:</strong> {order._id}
          </p>
          <p>
            <strong>Payment status:</strong> {order.paymentStatus}
          </p>
          <p>
            <strong>Order status:</strong> {order.status}
          </p>
          <p>
            <strong>Total paid:</strong> ₹
            {Number(order.totalAmount).toLocaleString('en-IN')}
          </p>
        </div>

        <h2>Items ordered</h2>
        {order.items?.map((item, index) => (
          <div key={`${item.name}-${index}`} style={styles.item}>
            <span>
              {item.name} × {item.quantity}
            </span>
            <strong>
              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
            </strong>
          </div>
        ))}

        <button
          onClick={() => navigate('/products', { replace: true })}
          style={styles.button}
        >
          Continue shopping
        </button>
      </section>
    </main>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: '32px 20px',
    background: '#f5f5f5',
    color: '#171717',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '620px',
    background: '#fff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  check: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#dcfce7',
    color: '#15803d',
    display: 'grid',
    placeItems: 'center',
    fontSize: '36px',
    fontWeight: 700,
  },
  details: {
    margin: '24px 0',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    overflowWrap: 'anywhere',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '12px 0',
    borderBottom: '1px solid #eee',
  },
  button: {
    width: '100%',
    marginTop: '24px',
    padding: '13px',
    border: 0,
    borderRadius: '6px',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default OrderConfirmation;
