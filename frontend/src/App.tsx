import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import ChangePassword from './pages/ChangePassword';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';

import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* DEFAULT ROUTE */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* AUTHENTICATION */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* MAIN PAGES */}
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          {/* WISHLIST */}
          <Route path="/wishlist" element={<Wishlist />} />

          {/* CART AND CHECKOUT */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* ORDER CONFIRMATION */}
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />

          {/* ACCOUNT */}
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/orders" element={<Orders />} />
          {/* UNKNOWN ROUTES */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
