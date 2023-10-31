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

  //Service
  app.use("/api/service", serviceRoute);

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

  
};
export default routes;
