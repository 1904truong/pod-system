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
// 1. Import trang AddPage mới
import AddPage from "./pages/AddPage";

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
        <Route path="/product" element={<ProductDetailPage />} />

        <Route path="/designer" element={<DesignerPage />} />
        {/* Đường dẫn này hiện ra trang All Products theo ảnh mẫu */}
        <Route path="/addpage" element={<AddPage />} />

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
