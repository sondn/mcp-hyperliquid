# MCP Hyperliquid Server

MCP server tích hợp với Hyperliquid protocols, cung cấp các công cụ để tương tác với sàn giao dịch Hyperliquid thông qua giao thức Model Context Protocol.

## Tính năng

### Truy vấn thông tin
- **Query Positions**: Xem danh sách các vị thế (positions) hiện tại
- **Query Orders**: Xem danh sách lệnh (orders) đang mở và lịch sử
- **Market Data**: Lấy thông tin thị trường, giá, volume

### Quản lý giao dịch
- **Create Orders**: Tạo lệnh mua/bán mới
- **Cancel Orders**: Hủy lệnh đang mở
- **Modify Orders**: Chỉnh sửa lệnh hiện có

## Cài đặt

### Yêu cầu
- Node.js >= 18
- Private key của ví Hyperliquid

### Cấu hình Claude Desktop

Thêm cấu hình sau vào file `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hyperliquid": {
      "command": "node",
      "args": ["/path/to/mcp-hyperliquid/build/index.js"],
      "env": {
        "HYPERLIQUID_PRIVATE_KEY": "your_private_key_here",
        "HYPERLIQUID_TESTNET": "false"
      }
    }
  }
}
```

**Tham số cấu hình:**
- `HYPERLIQUID_PRIVATE_KEY`: Private key của ví Hyperliquid (bắt buộc)
- `HYPERLIQUID_TESTNET`: `true` để sử dụng testnet, `false` hoặc không set để dùng mainnet

## Sử dụng

Sau khi cấu hình xong, bạn có thể sử dụng các công cụ trong Claude Desktop:

### Ví dụ truy vấn
```
- "Hiển thị tất cả positions hiện tại của tôi"
- "Xem danh sách orders đang mở"
- "Giá hiện tại của BTC-PERP là bao nhiêu?"
```

### Ví dụ giao dịch
```
- "Tạo lệnh mua 0.1 BTC-PERP ở giá $50000"
- "Hủy tất cả orders đang mở"
- "Đóng vị thế ETH-PERP"
```

## Bảo mật

⚠️ **Quan trọng:**
- Không bao giờ commit private key vào git
- Private key được cấu hình trực tiếp trong Claude Desktop config
- Sử dụng testnet để test trước khi giao dịch thật
- Kiểm tra kỹ các thông số trước khi thực hiện lệnh

## Phát triển

```bash
# Cài đặt dependencies
npm install

# Build project
npm run build

# Chạy tests
npm test

# Development mode
npm run dev
```

## API Hyperliquid

Server này sử dụng:
- **REST API**: Truy vấn dữ liệu tài khoản, thị trường
- **WebSocket API**: Nhận cập nhật real-time
- **Ed25519 signatures**: Ký các giao dịch authenticated

## License

MIT
