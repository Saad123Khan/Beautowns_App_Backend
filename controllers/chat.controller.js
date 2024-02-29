import asyncHandler from "#middlewares/asyncHandler";
import { Chat, validateChat } from "#models/chat_model";

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

export { saveMessage, getMessages };
