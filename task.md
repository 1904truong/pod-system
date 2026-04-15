# POD Sunz - Backend & Database Roadmap

Tài liệu này liệt kê toàn bộ các phần việc cần thực hiện để biến giao diện Frontend hiện tại thành một hệ thống POD (Print on Demand) hoạt động thực tế.

## 1. Công nghệ đề xuất (Tech Stack)
*   **Runtime**: Node.js (v20+)
*   **Framework**: Express.js (ổn định, linh hoạt)
*   **Database**: **MySQL** (SQL - Phổ biến, tin cậy cho dữ liệu tài chính & đơn hàng)
*   **Giao tiếp DB**: Prisma ORM (Hỗ trợ MySQL tốt, giúp quản lý dữ liệu dễ dàng)
*   **Xác thực**: JWT (JSON Web Tokens) cho quản lý phiên làm việc.
*   **Lưu trữ**: AWS S3 hoặc Cloudinary (Cho file thiết kế Artwork).

---

## 2. Thiết kế Database Schema (SQL)
Hệ thống sẽ bao gồm các bảng dữ liệu cốt lõi sau:

### Nhóm Quản lý Người dùng & Cửa hàng
*   **Users**: Email, password, avatar, role (Admin/User).
*   **Stores**: Tên store, URL store, kết nối (Shopify/WooCommerce), logo.
*   **Settings**: Thông tin cá nhân, cài đặt thanh toán, thông báo.

### Nhóm Quản lý Catalog & Thiết kế
*   **BaseProducts**: Danh mục sản phẩm gốc (Áo, mũ, cốc) từ nhà sản xuất.
*   **Artworks**: Kho lưu trữ file thiết kế (PNG/SVG), metadata (kích thước, định dạng).
*   **Campaigns**: Các chiến dịch bán hàng, liên kết sản phẩm gốc với thiết kế.
*   **CampaignProducts**: Chi tiết từng sản phẩm trong chiến dịch (Màu sắc, kích cỡ, giá bán).

### Nhóm Quản lý Đơn hàng & Tài chính
*   **Orders**: Mã đơn hàng, khách hàng, trạng thái (Pending/Printing/Shipped), tổng tiền.
*   **Wallets**: Số dư hiện tại, tiền đang chờ (Pending), tiền đã rút (Paid).
*   **Transactions**: Lịch sử chi tiết các giao dịch (Nạp tiền, trừ tiền in, rút tiền).

---

## 3. Danh sách các API cần xây dựng
Chia theo các module bạn đã thấy ở Frontend:

### Module Auth & Profile
- [ ] POST `/api/auth/register` & `/api/auth/login`
- [ ] GET/PUT `/api/user/profile` (Đồng bộ trang Settings)

### Module Stores & Campaigns
- [ ] GET `/api/stores` - Lấy danh sách cửa hàng.
- [x] Modify `campaignController.js` to link new campaigns to a default collection <!-- id: 0 -->
- [x] Update `Store.collectionsPublishedAt` automatically upon campaign creation <!-- id: 1 -->
- [x] Fix `StoreLaunchView.jsx` to preserve artwork property in product data
- [x] Verify design visibility on the storefront
- [x] Problem: "Save and continue" button not working (localStorage quota exceeded)
- [x] Optimize `ReviewProductsPage.jsx` storage and add error alerts
- [x] Verify fix by creating a multi-product campaign
- [x] Provide walkthrough to user
- [ ] Verify that new campaigns appear on the storefront without manual publishing <!-- id: 2 -->
- [ ] POST `/api/campaigns` - Tạo chiến dịch mới (Lưu thông tin sản phẩm đã chọn).
- [ ] GET `/api/campaigns` - Danh sách chiến dịch đang chạy.

### Module Artwork Library
- [ ] POST `/api/artworks/upload` - Tải ảnh lên S3/Cloudinary.
- [ ] GET `/api/artworks` - Lấy danh sách file thiết kế đã tải lên.

### Module Orders
- [ ] GET `/api/orders` - Danh sách đơn hàng (Filter theo trạng thái).
- [ ] GET `/api/orders/:id` - Chi tiết đơn hàng.

### Module Payouts & Task Log
- [ ] GET `/api/wallet/balance` - Lấy số dư hiện tại.
- [ ] GET `/api/wallet/transactions` - Lịch sử giao dịch tiền tệ.
- [ ] GET `/api/tasks` - Nhật ký tác vụ hệ thống (Đồng bộ trang Task Log).

---

## 4. Các tính năng nâng cao (Giai đoạn sau)
*   **Mockup Generator**: Tự động ghép ảnh thiết kế lên áo trắng để tạo ảnh demo.
*   **Sync Engine**: Tự động đẩy sản phẩm từ Backend lên Shopify/WooCommerce.
*   **Webhooks**: Nhận thông tin tự động khi có đơn hàng mới từ Store.

---

## Câu hỏi & Yêu cầu của người dùng
> [!IMPORTANT]
> 1. Bạn muốn tôi bắt đầu khởi tạo cấu trúc thư mục `server/` và kết nối Prisma ngay bây giờ không?
> 2. Có phần nào trong danh sách trên bạn muốn lược bỏ hoặc ưu tiên làm trước không?
