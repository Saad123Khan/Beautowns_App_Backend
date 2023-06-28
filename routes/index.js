import error from "#middlewares/error";
import userRoute from "#routes/user.routes";
import authRoute from "#routes/auth.routes";

const routes = (app) => {
  // app.get("*",(req,res)=>{
  //   res.send("404 Page Not Found!")
  // })

  app.use(error);

  //Auth
  app.use("/api/auth", authRoute);

  //User
  app.use("/api/user", userRoute);


};
export default routes;
