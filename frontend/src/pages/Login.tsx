import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ======================================================
  // LOGIN
  // ======================================================

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    // Validate fields
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      // Send login request
      const response = await api.post('/customers/login', {
        email: email.trim(),
        password,
      });

      console.log('LOGIN RESPONSE:', response.data);

      // Get JWT token from backend response
      const token = response.data?.token;

      // Make sure token was returned
      if (!token) {
        setError('Login succeeded, but authentication token was not received.');
        return;
      }

      // Store token for authenticated API requests
      localStorage.setItem('shopkart_token', token);

      console.log('TOKEN SAVED:', !!localStorage.getItem('shopkart_token'));

      // Go to home page
      navigate('/home');
    } catch (err: any) {
      console.error('LOGIN ERROR:', err);

      setError(
        err.response?.data?.message ||
          'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Welcome Back!</h1>

        <p style={styles.subtitle}>Login to your ShopKart account</p>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>Email</label>

        <input
          style={styles.input}
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <label style={styles.label}>Password</label>

        <input
          style={styles.input}
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Register
          </Link>
        </p>
      </form>
    </div>
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f3f4f6',
    padding: '20px',
    boxSizing: 'border-box',
  },

  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#ffffff',
    padding: '40px 32px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    boxSizing: 'border-box',
  },

  title: {
    textAlign: 'center',
    margin: '0 0 10px',
    color: '#111827',
    fontSize: '42px',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.5px',
  },

  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    margin: '0 0 28px',
    fontSize: '18px',
    lineHeight: 1.5,
  },

  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 600,
    color: '#374151',
    fontSize: '16px',
  },

  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontSize: '15px',
    color: '#111827',
    background: '#ffffff',
  },

  button: {
    width: '100%',
    padding: '13px',
    background: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 600,
  },

  error: {
    color: '#dc2626',
    background: '#fee2e2',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px',
  },

  footer: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#6b7280',
  },

  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
  },
};

export default Login;
