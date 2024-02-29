import asyncHandler from "#middlewares/asyncHandler";
import { Chat, validateChat } from "#models/chat_model";
import { User } from "#models/user_model";


const saveMessage = asyncHandler(async (req, res) => {
  const { error } = validateChat(req.body);
  if (error) {
    return res
      .status(400)
      .send({ status: false, message: error?.details[0]?.message });
  }

  const newMessage = new Chat(req.body);
  const savingMsg = await newMessage.save();
  return savingMsg;
});

const getMessages = asyncHandler(async (req, res) => {
  const messages = await Chat.find({
    $or: [
      { sender_Id: req.body.sender_Id, receiver_Id: req.body.receiver_Id },
      { sender_Id: req.body.receiver_Id, receiver_Id: req.body.sender_Id },
    ],
    isDeleted: false,
  }).sort({ createdAt: 1 });

  return messages
});






//@desc  User Seen Notification
//@route  /user/notification-seen/:id
//@request Get Request
//@acess  private

const userMessageSeen = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: false,
    role: "user",
  });
  if (!user) {
    return res.status(200).json({ status: false, message: "User not exists!" });
  }

  const messages = await Chat.updateMany(
    { sender_Id: req.params.id, isSeen: false },
    { isSeen: true }
  );


  if (messages) {
    return res
      .status(200)
      .json({ status: true, message: "Message seen sucessfully" });
  } else {
    return res.status(404).json({ status: false, message: "Nothing to seen" });
  }


});

export { saveMessage, getMessages , userMessageSeen };
