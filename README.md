# ShopKart — Full-Stack E-Commerce Application

ShopKart is a full-stack e-commerce web application built with React, TypeScript, Node.js, Express, and MongoDB. It provides a shopping experience with customer authentication, product browsing, cart management, wishlists, order management, and payment integration.

## Live Demo

- **Frontend:** https://shopkart-delta-seven.vercel.app/
- **Backend API:** https://shopkart-api-lgtr.onrender.com/
- **Source Code:** https://github.com/arunima26vats/shopkart

## Features

- Customer registration and login
- Secure authentication using JWT and cookies
- Product browsing and product details
- Shopping cart management
- Wishlist management
- Checkout and order placement
- Razorpay payment integration in test mode
- Order confirmation, order history, and order tracking
- MongoDB database integration

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- Cookie Parser
- Razorpay

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

## Project Structure

```text
shopkart/
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── .gitignore
```

## Run Locally

### Prerequisites
- Node.js and npm
- A MongoDB Atlas database or local MongoDB instance

### 1. Clone the repository

```bash
git clone https://github.com/arunima26vats/shopkart.git
cd shopkart
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=development
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Replace the placeholder values with your own credentials. Never commit your `.env` file or expose secret keys publicly.

Start the backend:

```bash
npm start
```

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend`:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend development server:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Environment Variables

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used for JWT signing |
| `NODE_ENV` | Application environment |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `VITE_API_URL` | Backend API base URL used by the frontend |

## Deployment

The frontend is deployed on Vercel and the backend on Render. The backend connects to MongoDB Atlas.

For deployment, configure the required environment variables in the respective hosting dashboards. Use test credentials for payment testing and configure production secrets securely.

## Future Improvements

- Enhanced automated testing
- Improved error handling and validation
- Responsive UI and accessibility improvements
- Production payment configuration
- Additional product discovery and administration features

## License

No license has been specified yet.
