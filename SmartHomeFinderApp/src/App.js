import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomeScreen from './screens/HomeScreen';
import Navbar from './components/Navbar';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import SignUpScreen from './screens/SignUpScreen';
import AddProperty from './screens/AddProperty';
import PropertyRequestScreen from './screens/PropertyRequestScreen';
import ForgotPassword from './screens/ForgetPasswordScreen';
import ResetPassword from './screens/ResetPasswordScreen';
import AdminDashboard from './screens/AdminDashboard';
import StickyBoard from './components/StickyBoard';
import HistoryScreen from './screens/HistoryScreen';
import PropertyDetailsScreen from './screens/PropertyDetailsScreen';
import AboutScreen from './screens/AboutScreen';
import CategoryScreen from './screens/CategoryScreen';
import LegalPoliciesScreen from './screens/LegalPoliciesScreen';
import FaqScreen from './screens/FaqScreen';
import BankAccountScreen from './screens/BankAccountScreen';
import SearchResults from './screens/SearchResults';
import PaymentCardsScreen from './screens/PaymentCardsScreen';
import PaymentScreen from './screens/PaymentScreen';
import PaymentVerifyScreen from './screens/PaymentVerifyScreen';
import MoneyBoxScreen from './screens/MoneyBoxScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import WishlistScreen from './screens/WishlistScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/UserContext';

// Protected Route Component with optional role check
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" />;

  if (requiredRole) {
    if (!user || user.role !== requiredRole) {
      return <Navigate to="/" />;
    }
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
    <Router>
      <div>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Navbar />

        {/* Main content with padding for fixed navbar */}
        <div id="main-content" style={{ paddingTop: '80px', minHeight: '100vh' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomeScreen />} />
            <Route exact path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route path="/forgetpassword" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/property/:id" element={<PropertyDetailsScreen />} />
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/category/:slug" element={<CategoryScreen />} />
            <Route path="/legal" element={<LegalPoliciesScreen />} />
            <Route path="/faq" element={<FaqScreen />} />
            <Route path="/search" element={<SearchResults />} />
            <Route
              path="/bank-account"
              element={
                <ProtectedRoute>
                  <BankAccountScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-cards"
              element={
                <ProtectedRoute>
                  <PaymentCardsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/moneybox"
              element={
                <ProtectedRoute>
                  <MoneyBoxScreen />
                </ProtectedRoute>
              }
            />
            <Route path="/payment/verify" element={<PaymentVerifyScreen />} />
            <Route
              path="/checkout/:propertyId"
              element={
                <ProtectedRoute>
                  <PaymentScreen />
                </ProtectedRoute>
              }
            />

            {/* Protected Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfileScreen />
                </ProtectedRoute>
              }
            />

            <Route 
              path="/add-property"
              element={
                <ProtectedRoute requiredRole="landlord">
                  <AddProperty />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/property-request"
              element={
                <ProtectedRoute>
                  <PropertyRequestScreen />
                </ProtectedRoute>
              } 
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistScreen />
                </ProtectedRoute>
              }
            />



            {/* Optional: Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <StickyBoard />
      </div>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
