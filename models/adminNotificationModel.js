import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema({
    target:{
      type : String,
      enum : ['Users', 'Salons','Staffs','Specific-User','Specific-Staff','Specific-Salon']
    },
    userIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    type: {
        type: String,
    },
    notification: {
        title: {
            type: String
        },
        body: {
            type: String
        },
        image:{
            type:String,
        }
    },
    
}, { timestamps: true });

const AdminNotification = mongoose.model("AdminNotification", adminNotificationSchema);

export default AdminNotification;
