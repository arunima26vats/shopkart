import { useState } from 'react';
import type { ChangeEvent, FormEvent, CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const navigate = useNavigate();

  // IMPORTANT: Backend expects fullName, not name
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password
    ) {
      setError('Please fill in all fields.');
      return;
    }

    // Backend requires at least 6 characters
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);

      // Sends fullName, email, phone, password
      const response = await api.post('/customers/register', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      if (response.data.success) {
        alert('Registration successful! Please log in.');
        navigate('/login');
      } else {
        setError(response.data.message || 'Registration failed.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>

        <p style={styles.subtitle}>Join ShopKart today!</p>

        {error && <p style={styles.error}>{error}</p>}

        {/* Full Name */}
        <label htmlFor="fullName" style={styles.label}>
          Full Name
        </label>

        <input
          id="fullName"
          style={styles.input}
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          value={form.fullName}
          onChange={handleChange}
          autoComplete="name"
          required
        />

        {/* Email */}
        <label htmlFor="email" style={styles.label}>
          Email
        </label>

        <input
          id="email"
          style={styles.input}
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />

        {/* Phone */}
        <label htmlFor="phone" style={styles.label}>
          Phone
        </label>

        <input
          id="phone"
          style={styles.input}
          type="tel"
          name="phone"
          placeholder="Enter your phone number"
          value={form.phone}
          onChange={handleChange}
          autoComplete="tel"
          required
        />

        {/* Password */}
        <label htmlFor="password" style={styles.label}>
          Password
        </label>

        <input
          id="password"
          style={styles.input}
          type="password"
          name="password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          minLength={6}
          required
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
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
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    boxSizing: 'border-box',
  },

  title: {
    textAlign: 'center',
    marginBottom: '8px',
    color: '#111827',
    fontSize: '30px',
  },

  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: '24px',
    fontSize: '16px',
  },

  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 600,
    color: '#374151',
  },

  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontSize: '15px',
  },

  button: {
    width: '100%',
    padding: '13px',
    background: '#2563eb',
    color: 'white',
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
    textAlign: 'center',
  },

  footer: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#374151',
  },

  link: {
    color: '#2563eb',
    fontWeight: 600,
  },
};

export default Register;
