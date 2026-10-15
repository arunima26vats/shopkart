import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
}

function Home() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/customers/me');

        // Supports either { customer: {...} } or direct profile response
        const profile = response.data.customer || response.data;

        setCustomer(profile);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return <p style={{ textAlign: 'center' }}>Loading profile...</p>;
  }

  if (!customer) {
    return null;
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.content}>
        <h1>Welcome to ShopKart!</h1>
        <p>Your shopping journey starts here.</p>

        <div style={styles.profile}>
          <h2>Your Profile</h2>

          <p>
            <strong>Full Name:</strong> {customer.fullName}
          </p>

          <p>
            <strong>Email:</strong> {customer.email}
          </p>

          <p>
            <strong>Phone:</strong> {customer.phone}
          </p>
        </div>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: '#f3f4f6',
  },
  content: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '40px',
    background: 'white',
    borderRadius: '16px',
    textAlign: 'center',
    boxSizing: 'border-box',
    color: '#111827',
  },
  profile: {
    marginTop: '40px',
    padding: '24px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
  },
};

export default Home;
