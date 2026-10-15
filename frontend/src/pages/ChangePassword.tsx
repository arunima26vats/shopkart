import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function ChangePassword() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from your old password.');
      return;
    }

    try {
      setLoading(true);

      await api.patch('/customers/change-password', {
        currentPassword: oldPassword,
        newPassword,
      });

      setSuccess('Password changed successfully!');

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Change password failed:', err);

      setError(
        err.response?.data?.message ||
          'Unable to change password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Change Password</h1>

        <p style={styles.subtitle}>Update your ShopKart account password</p>

        {error && <p style={styles.error}>{error}</p>}

        {success && <p style={styles.success}>{success}</p>}

        <label style={styles.label}>Current Password</label>

        <input
          type="password"
          placeholder="Enter current password"
          value={oldPassword}
          onChange={(event) => setOldPassword(event.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>New Password</label>

        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Confirm New Password</label>

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          style={styles.input}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/home')}
          style={styles.backButton}
        >
          Back to Home
        </button>
      </form>
    </div>
  );
}

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
    maxWidth: '450px',
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
    fontSize: '34px',
    fontWeight: 700,
  },

  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    margin: '0 0 28px',
    fontSize: '16px',
  },

  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 600,
    color: '#374151',
    fontSize: '15px',
  },

  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '18px',
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
    cursor: 'pointer',
  },

  backButton: {
    width: '100%',
    padding: '12px',
    marginTop: '10px',
    background: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },

  error: {
    color: '#dc2626',
    background: '#fee2e2',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px',
  },

  success: {
    color: '#15803d',
    background: '#dcfce7',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px',
  },
};

export default ChangePassword;
