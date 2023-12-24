import rp from 'request-promise';
import Notification from "#models/notificationModel";
import { sendNotificationEmail } from '#utils/email';
import { sockets } from '../server.js';

export const firebaseNotification = async (notification, users, type, target, from, to) => {
  const send = async (token, notification, type, target, email, userId) => {
    //  await Notification.deleteMany({})
    console.log(users)
    console.log(token)
    console.log(notification)
    try {
      if (token) {
        const options = {
          method: 'POST',
          uri: 'https://fcm.googleapis.com/fcm/send',
          headers: {
            Authorization: 'key=AAAAZrClWhQ:APA91bHl5iDUWz6IaHV7NQWbKw6BVqqdeQOLLcwg5j7i6246wxM442-z5SyYfGJLWTW1DxunM01jYKMVi2GfUBSmenojrV9uH-6so7c3nqKOi7HHS6O4STzUfhF4HgOPYiS3VlYI0d8R',
            'Content-Type': 'application/json',
          },
          body: {
            notification,
            to: token,
          },
          json: true,
        };

        const notificationCreated = notification.image ? await new Notification({ token, notification, target, type, userId, image: notification.image, from, to }) :
          await new Notification({ token, notification, target, type, userId, from, to })
        await notificationCreated.save();

        await sendNotificationEmail(email, notification)
        const response = await rp(options);
        console.log('Notification sent:', response);
        const notifications = await Notification.find({ userId: notificationCreated?.userId }).sort({ createdAt: -1 }).populate("userId")
        const unSeenNotifications = await Notification.find({ userId: notificationCreated?.userId, isSeen: false }).countDocuments()
 
        
        
      console.log(users,"US======= DAta")
        if(users?.[0]?.role === "user" || users?.role === "user")
        {
          console.log("CALL USER")
          sockets.sendNotificationSucess({ notifications, unSeenNotifications, userId: notificationCreated?.userId });
        }
        else if(users?.[0]?.role === "store" || users?.role === "store")
        { 
          console.log("CALL STORE1str")
          sockets.sendNotificationStoreSucess({ notifications, unSeenNotifications, userId: notificationCreated?.userId });
        }
        else if(users?.[0]?.role === "staff" || users?.role === "staff")
        {
          console.log("CALL STAFF")
          sockets.sendNotificationStaffSucess({ notifications, unSeenNotifications, userId: notificationCreated?.userId });
        }




        // console.log(notifications,"notifications")
      }
      else {
        const notificationCreated = notification.image ? await new Notification({ notification, target, type, userId, image: notification.image, from, to }) :
        await new Notification({ notification, target, type, userId, from, to })
        await notificationCreated.save();
        await sendNotificationEmail(email, notification)
        const notifications = await Notification.find({ userId: notificationCreated?.userId }).sort({ createdAt: -1 })
        const unSeenNotifications = await Notification.find({ userId: notificationCreated?.userId, isSeen: false }).countDocuments()
        // sockets.sendNotificationSucess({ notifications, unSeenNotifications, userId: notificationCreated?.userId });
      
      console.log(users,"USER------------- DAta")
        if(users?.[0]?.role === "user" || users?.role === "user")
        {
          console.log("CALL USER")
          sockets.sendNotificationSucess({ notifications, unSeenNotifications, userId: notificationCreated?.userId });
        }
        else if(users?.[0]?.role === "store" || users?.role === "store" )
        { 
          console.log("CALL STORE 2nd")
          sockets.sendNotificationStoreSucess({ notifications, unSeenNotifications, userId: notificationCreated?.userId });
        }
        else if(users?.[0]?.role === "staff" || users?.role === "staff")
        {
          console.log("CALL STAFF")
          sockets.sendNotificationStaffSucess({ notifications, unSeenNotifications, userId: notificationCreated?.userId });
        }

      
      }
    } catch (error) {
      console.log('Notification faled', error);
    }
  };

  // Send notifications to all devices identified by FCM tokens in the tokens array
  if (users?.length > 0) {
    await Promise.all(users.map((item) => send(item?.not_token, notification, type, target, item?.email, item?._id)));
  }
};
