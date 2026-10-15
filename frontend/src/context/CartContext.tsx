import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import api from '../services/api';

// ======================================================
// PRODUCT INTERFACE
// ======================================================

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

// ======================================================
// CART ITEM INTERFACE
// ======================================================

interface CartItem {
  product: Product;
  quantity: number;
}

// ======================================================
// CART CONTEXT INTERFACE
// ======================================================

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  error: string;

  totalItems: number;
  subtotal: number;

  refreshCart: () => Promise<void>;
  clearCart: () => Promise<boolean>;

  addToCart: (productId: string) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
}

// ======================================================
// CREATE CONTEXT
// ======================================================

const CartContext = createContext<CartContextType | undefined>(undefined);

// ======================================================
// CART PROVIDER
// ======================================================

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ======================================================
  // REFRESH CART
  // ======================================================

  const refreshCart = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/cart');

      setCartItems(response.data.cart || []);
    } catch (err: any) {
      console.error('GET CART ERROR:', err);

      setCartItems([]);

      if (err.response?.status === 401) {
        setError('');
      } else {
        setError(err.response?.data?.message || 'Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // CLEAR CART
  // ======================================================

  const clearCart = async (): Promise<boolean> => {
    try {
      setError('');

      /*
       * The current backend provides:
       * DELETE /cart/:productId
       *
       * Therefore, we remove each cart item individually.
       *
       * This function should only be called after successful
       * payment verification in Lab 6.
       */

      for (const item of cartItems) {
        await api.delete(`/cart/${item.product._id}`);
      }

      // Synchronize React state with the cleared database cart.
      setCartItems([]);

      return true;
    } catch (err: any) {
      console.error('CLEAR CART ERROR:', err);

      setError(err.response?.data?.message || 'Failed to clear cart');

      // Re-fetch the cart so frontend state remains
      // synchronized with the backend.
      await refreshCart();

      return false;
    }
  };

  // ======================================================
  // ADD TO CART
  // ======================================================

  const addToCart = async (productId: string): Promise<boolean> => {
    try {
      setError('');

      const response = await api.post(`/cart/${productId}`);

      setCartItems(response.data.cart || []);

      return true;
    } catch (err: any) {
      console.error('ADD TO CART ERROR:', err);

      setError(err.response?.data?.message || 'Failed to add product to cart');

      return false;
    }
  };

  // ======================================================
  // UPDATE QUANTITY
  // ======================================================

  const updateQuantity = async (
    productId: string,
    quantity: number
  ): Promise<boolean> => {
    try {
      setError('');

      const response = await api.patch(`/cart/${productId}`, {
        quantity,
      });

      setCartItems(response.data.cart || []);

      return true;
    } catch (err: any) {
      console.error('UPDATE CART QUANTITY ERROR:', err);

      setError(err.response?.data?.message || 'Failed to update quantity');

      return false;
    }
  };

  // ======================================================
  // REMOVE FROM CART
  // ======================================================

  const removeFromCart = async (productId: string): Promise<boolean> => {
    try {
      setError('');

      const response = await api.delete(`/cart/${productId}`);

      setCartItems(response.data.cart || []);

      return true;
    } catch (err: any) {
      console.error('REMOVE FROM CART ERROR:', err);

      setError(err.response?.data?.message || 'Failed to remove product');

      return false;
    }
  };

  // ======================================================
  // TOTAL ITEMS
  // ======================================================

  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // ======================================================
  // SUBTOTAL
  // ======================================================

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }, [cartItems]);

  // ======================================================
  // LOAD CART
  // ======================================================

  useEffect(() => {
    refreshCart();
  }, []);

  // ======================================================
  // PROVIDER
  // ======================================================

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,

        totalItems,
        subtotal,

        refreshCart,
        clearCart,

        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ======================================================
// CUSTOM HOOK
// ======================================================

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
};
