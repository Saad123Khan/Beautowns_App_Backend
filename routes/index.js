import error from "#middlewares/error";
import userRoute from "#routes/user.routes";
import authRoute from "#routes/auth.routes";
import serviceRoute from "#routes/service.routes";
import storeRoute from "#routes/store.routes";
import storeCategoryRoute from "#routes/storeCategory.routes";
import categoryRoute from "#routes/category.routes";
import staffRoute from "#routes/staff.routes";
import membershipRoute from "#routes/membership.routes";
import bookingRoute from "#routes/booking.routes";
import couponRoute from "#routes/coupon.routes";
import blogRoute from "#routes/blog.routes";
import adminCouponRoute from "#routes/Admin/admin.coupon.routes";
import adminStoreRoute from "#routes/Admin/admin.store.routes";
import adminNotificationRoute from "#routes/Admin/admin.notification.routes";
import paymentRoute from "#routes/payment.routes";
import staffPayrollRoutes from "#routes/staffPayroll.routes";
import adminAnalyticsRoute from "#routes/Admin/admin.analytics.routes";
import marketingRoute from "#routes/marketing.routes";

const routes = (app) => {
  // app.get("*",(req,res)=>{
  //   res.send("404 Page Not Found!")
  // })

  app.use(error);

  //Auth
  app.use("/api/auth", authRoute);

  //User
  app.use("/api/user", userRoute);

  //Store
  app.use("/api/store", storeRoute);
  app.use("/api/blog", blogRoute);
  app.use("/api/staffpayroll", staffPayrollRoutes);

  //Service
  app.use("/api/service", serviceRoute);
  app.use("/api/marketing", marketingRoute);

  //Staff
  app.use("/api/staff", staffRoute);

  //Category
  app.use("/api/category", categoryRoute);

  //Store Category
  app.use("/api/store-category", storeCategoryRoute);

  // MemberShips
  app.use("/api/membership", membershipRoute);

  // Booking
  app.use("/api/booking", bookingRoute);

  // Coupon
  app.use("/api/coupon", couponRoute);

  // Admin Coupon
  app.use("/api/admin/coupon", adminCouponRoute);
  // Admin Store
  app.use("/api/admin/store", adminStoreRoute);

  // Admin Notification
  app.use("/api/admin/notification", adminNotificationRoute);

  // Payment
  app.use("/api/payment", paymentRoute);

  // Analytics
  app.use("/api/admin/analytics", adminAnalyticsRoute);
};
export default routes;
