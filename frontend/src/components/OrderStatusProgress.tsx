type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PLACED'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED';

interface OrderStatusProgressProps {
  status: OrderStatus | string;
}

const steps = [
  { status: 'PLACED', label: 'Placed' },
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'DELIVERED', label: 'Delivered' },
];

export default function OrderStatusProgress({
  status,
}: OrderStatusProgressProps) {
  const currentIndex = steps.findIndex((step) => step.status === status);

  const isPendingPayment = status === 'PENDING_PAYMENT';

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Order tracking</h3>

      {isPendingPayment ? (
        <p style={styles.pending}>
          Payment pending — tracking will begin after payment is verified.
        </p>
      ) : currentIndex === -1 ? (
        <p style={styles.pending}>
          Current order status: {status.replaceAll('_', ' ')}
        </p>
      ) : (
        <div style={styles.progressWrapper}>
          <div style={styles.track} />

          <div
            style={{
              ...styles.trackCompleted,
              width: `${(currentIndex / (steps.length - 1)) * 100}%`,
            }}
          />

          <div style={styles.steps}>
            {steps.map((step, index) => {
              const isComplete = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div key={step.status} style={styles.step}>
                  <div
                    style={{
                      ...styles.circle,
                      ...(isComplete ? styles.completedCircle : {}),
                      ...(isCurrent ? styles.currentCircle : {}),
                    }}
                  >
                    {isComplete ? '✓' : index + 1}
                  </div>

                  <span
                    style={{
                      ...styles.label,
                      ...(isComplete ? styles.completedLabel : {}),
                      ...(isCurrent ? styles.currentLabel : {}),
                    }}
                  >
                    {step.label}
                  </span>

                  {isCurrent && <span style={styles.currentTag}>Current</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: 18,
    padding: 16,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    background: '#ffffff',
    color: '#1f2937',
  },
  heading: {
    margin: '0 0 22px',
    fontSize: 17,
    fontWeight: 700,
  },
  progressWrapper: {
    position: 'relative',
    paddingTop: 2,
  },
  track: {
    position: 'absolute',
    top: 17,
    left: '12.5%',
    right: '12.5%',
    height: 4,
    borderRadius: 4,
    background: '#e5e7eb',
  },
  trackCompleted: {
    position: 'absolute',
    top: 17,
    left: '12.5%',
    height: 4,
    maxWidth: '75%',
    borderRadius: 4,
    background: '#16a34a',
    transition: 'width 0.3s ease',
  },
  steps: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    gap: 4,
  },
  step: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    flexDirection: 'column',
    textAlign: 'center',
    gap: 7,
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    background: '#f3f4f6',
    border: '2px solid #d1d5db',
    color: '#6b7280',
    fontSize: 13,
    fontWeight: 700,
    zIndex: 1,
  },
  completedCircle: {
    background: '#16a34a',
    borderColor: '#16a34a',
    color: '#ffffff',
  },
  currentCircle: {
    boxShadow: '0 0 0 4px #dcfce7',
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    overflowWrap: 'anywhere',
  },
  completedLabel: {
    color: '#166534',
  },
  currentLabel: {
    fontWeight: 700,
  },
  currentTag: {
    fontSize: 10,
    color: '#166534',
    background: '#dcfce7',
    padding: '3px 6px',
    borderRadius: 10,
  },
  pending: {
    margin: 0,
    fontSize: 13,
    color: '#92400e',
    background: '#fffbeb',
    padding: 12,
    borderRadius: 8,
  },
};
import type { CSSProperties } from 'react';
