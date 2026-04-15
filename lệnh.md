1) Chuẩn bị Node đúng version

Nếu dùng nvm: nvm install && nvm use
2) Cài dependencies

Cài client (root): npm install
Cài server: npm --prefix server install
3) Chạy dev

Chạy cả client + server cùng lúc (khuyến nghị): npm run dev:full
Hoặc chạy riêng:
Client: npm run dev
Server: npm --prefix server run dev
4) Kiểm tra chất lượng / build

Lint: npm run lint
Build production: npm run build
Preview build: npm run preview