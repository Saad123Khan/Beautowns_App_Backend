import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    target:{
      type : String,
      enum : ['Users', 'Salons','Staffs','Specific-User','Specific-Staff','Specific-Salon']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
    }, 
    from: {
        type: String,
        enum : ['system' , 'admin','store'],  
      default:"system"
    },
    to: {
        type: String,
        enum : ['users',"staffs",'admin'],  
        default:"users"
    },
    type: {
        type: String,
    },
    token: {
        type: String
    },
    notification: {
        title: {
            type: String
        },
        body: {
            type: String
        },
    },
    image:{
        type:String,
    },
    isSeen:{
        type : Boolean,
        default : false
    }

}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
