import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import các trang bạn đã làm
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import DesignerPage from "./pages/DesignerPage";
import SetPricingPage from "./pages/SetPricingPage";
import ReviewProductsPage from "./pages/ReviewProductsPage";
// 1. Import trang AddPage mới
import AddPage from "./pages/AddPage";
import StoreLaunchView from "./pages/StoreLaunchView";
import CatalogProductDetail from "./pages/CatalogProductDetail";
import CheckoutPage from "./pages/CheckoutPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AboutPage from "./pages/AboutPage";
import HelpPage from "./pages/HelpPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang mặc định khi mở web sẽ là Home */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Cấu trúc này giúp nhận diện Catalog / :mainCat / :subCat */}
        <Route path="/category" element={<CategoryPage />} />

        {/* :id là mã định danh riêng của từng sản phẩm */}
        <Route path="/product/:id" element={<ProductDetailPage />} />

        {/* 👑 NHÓM ADMIN */}
        <Route path="/addpage" element={<ProtectedRoute allowedRoles={['admin']}><AddPage /></ProtectedRoute>} />
        <Route path="/designer" element={<ProtectedRoute allowedRoles={['admin']}><DesignerPage /></ProtectedRoute>} />
        <Route path="/pricing" element={<ProtectedRoute allowedRoles={['admin']}><SetPricingPage /></ProtectedRoute>} />
        <Route path="/review" element={<ProtectedRoute allowedRoles={['admin']}><ReviewProductsPage /></ProtectedRoute>} />
        <Route path="/catalog-product/:id" element={<ProtectedRoute allowedRoles={['admin']}><CatalogProductDetail /></ProtectedRoute>} />

        {/* 👤 NHÓM KHÁCH HÀNG (CÔNG KHAI) */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/store/:storeUrl" element={<StoreLaunchView />} />
        <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}><CheckoutPage /></ProtectedRoute>} />

        {/* Đường dẫn cho Login và Signup */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Nếu người dùng gõ bậy bạ thì đẩy về Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
