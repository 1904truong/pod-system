Nhóm trang dành cho Người Dùng (Khách mua hàng)
Đây là các trang công khai (Storefront) nơi khách hàng vào xem sản phẩm, duyệt danh mục và tiến hành thanh toán:

Trang chủ (/ hoặc /home): Giới thiệu cửa hàng, hiển thị các bộ sưu tập, banner giảm giá.
Trang danh mục (/category): Nơi khách hàng dùng bộ lọc để tìm kiếm áo, quần, màu sắc, giá cả...
Chi tiết sản phẩm (/product/:id): Trang khách hàng vào xem chi tiết 1 sản phẩm cụ thể, chọn size, số lượng và bấm mua.
Cửa hàng của Seller (/store/:storeUrl): Giao diện cửa hàng tùy chỉnh của riêng một Admin nào đó (StoreLaunchView).
Thanh toán (/checkout): Giao diện hoàn tất đơn hàng và nhập thông tin vận chuyển.
👑 Nhóm trang dành cho Admin / Nền tảng (Chủ cửa hàng)
Như bạn đã nhắc đến, addpage là trang trung tâm của Admin. Các trang dưới đây phục vụ cho mục đích vận hành, thiết kế và quản lý chiến dịch bán hàng:

Bảng điều khiển Admin (/addpage): (Dashboard) Nơi xem doanh thu, xem danh sách Orders, cài đặt hệ thống và quản lý sản phẩm.
Chọn phôi sản phẩm (/catalog-product/:id): Nơi Admin xem thông tin chi tiết của các "phôi áo" (Base Products), giá gốc, màu sắc để quyết định xem có dùng nó in hình bán không.
Trang thiết kế (/designer): Nền tảng để Admin tải hình ảnh (artwork) lên và ướm thử vào mẫu áo.
Cài đặt giá bán (/pricing): Hệ thống đặt giá bán lẻ, tính toán lợi nhuận và cảnh báo khu vực (Profit Margin).
Duyệt lại chiến dịch (/review): Trang tóm tắt chiến dịch thiết kế trước khi Admin chính thức đưa ra bán.
🔐 Nhóm dùng chung (Chưa đăng nhập)
Đăng nhập (/login) & Đăng ký (/signup): Nơi để xác thực tài khoản (Hệ thống có thể chia role Admin/User từ lúc đăng nhập ở đây).