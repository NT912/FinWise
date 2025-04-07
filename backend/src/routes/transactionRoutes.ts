import express, { Request, Response, NextFunction } from "express";
import * as transactionController from "../controllers/transactionController";
import { authenticateJWT } from "../middleware/authMiddleware";

// Định nghĩa kiểu Request với user để phù hợp với controller
interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

const router = express.Router();

// Áp dụng middleware xác thực cho tất cả routes
router.use(authenticateJWT);

// Wrapper để chuyển đổi kiểu giữa controller và router
const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Lấy tất cả giao dịch
router.get(
  "/transactions",
  asyncHandler(transactionController.getAllTransactions)
);

// Lấy giao dịch theo khoảng thời gian
router.get(
  "/transactions/date-range",
  asyncHandler(transactionController.getTransactionsByDateRange)
);

// Lấy giao dịch theo danh mục
router.get(
  "/transactions/category/:categoryId",
  asyncHandler(transactionController.getTransactionsByCategory)
);

// Lấy chi tiết một giao dịch
router.get(
  "/transactions/:transactionId",
  asyncHandler(transactionController.getTransactionById)
);

// Tạo giao dịch mới
router.post(
  "/transactions",
  asyncHandler(transactionController.createTransaction)
);

// Cập nhật giao dịch
router.put(
  "/transactions/:transactionId",
  asyncHandler(transactionController.updateTransaction)
);

// Xóa giao dịch
router.delete(
  "/transactions/:transactionId",
  asyncHandler(transactionController.deleteTransaction)
);

export default router;
