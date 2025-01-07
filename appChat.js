const Message = require("./models/messageModel");
const ChatRoom = require("./models/chatModel");
const { checkRoomAccess } = require("./controllers/socketControllers");
const Notification = require("./models/notificationModel");

// Socket.IO event handlers
module.exports = matchMediayIoEventHandlers = function (myIo) {
  return myIo.on("connection", (socket) => {
    // Auto-join user to their room
    socket.join(socket.currentUserRoom._id.toString());
    console.log(
      `Welcome........ ${socket.currentUserDecode.role} connected && Joind default room:`,
      socket.currentUserRoom._id.toString()
    );

    // If user is admin, join admin room for updates
    if (socket.currentUserDecode.role === "admin") {
      socket.join("admin-updates");
      console.log(`Welcome........Joined admin room: admin-updates`);
    }

    socket.on("join_room", function ({ roomId }) {
      if (socket.currentUserDecode.role === "admin" && roomId) {
        socket.join(roomId);
      }
    });

    socket.on("leave_room", function ({ roomId }) {
      if (socket.currentUserDecode.role === "admin" && roomId) {
        socket.leave(roomId);
        console.log(`Admin left room: ${roomId}`);
      }
    });

    socket.on(
      "message",
      async function handleMessage({ roomId, msgData: { text } }) {
        try {
          const targetRoom = await checkRoomAccess(socket, roomId);
          console.log("message", roomId, text, socket.currentUserDecode.role);

          const message = await Message.create({
            room: targetRoom._id,
            sender: socket.currentUserDecode.id,
            text,
          });

          // Update room status
          targetRoom.lastMessage = message._id;
          targetRoom.isActive = true;
          if (socket.currentUserDecode.role !== "admin") {
            targetRoom.unreadCount++;
          } else {
            const notification = await Notification.create({
              recipient: targetRoom.user,
              type: "message",
              title: "رسالة جديدة",
              text: message.text,
            });
            myIo
              .to(targetRoom._id.toString())
              .emit("new_notification", notification);
          }
          await targetRoom.save();

          // Emit message only to the specific room
          myIo.to(targetRoom._id.toString()).emit("new_message", message);
          // Notify admins about room update
          myIo.to("admin-updates").emit("rooms_last_msg_updated", message);
        } catch (error) {
          console.log("MSG ERROR:", error);
          socket.emit("error", {
            message: error.message || "حدث خطأ أثناء إرسال الرسالة",
          });
        }
      }
    );

    // Typing events with room access check
    socket.on("start_typing", async function ({ roomId }) {
      try {
        const targetRoom = await checkRoomAccess(socket, roomId);
        myIo.to(targetRoom._id.toString()).emit("user_started_typing", {
          userId: socket.currentUserDecode.id,
          roomId,
        });
      } catch (error) {
        socket.emit("error", {
          message: error.message || "حدث خطأ أثناء إرسال حالة الكتابة",
        });
      }
    });

    socket.on("stop_typing", async function ({ roomId }) {
      try {
        const targetRoom = await checkRoomAccess(socket, roomId);
        myIo.to(targetRoom._id.toString()).emit("user_stopped_typing", {
          userId: socket.currentUserDecode.id,
          roomId,
        });
      } catch (error) {
        socket.emit("error", {
          message:
            error.message || "حدث خطأ أثناء إرسال حالة التوقف عن الكتابة",
        });
      }
    });

    // Request updated room list (for admin reconnection)
    socket.on("get_room_list", async function () {
      if (socket.currentUserDecode.role === "admin") {
        try {
          const rooms = await ChatRoom.find({ isActive: true });
          socket.emit("room_list_updated", rooms);
        } catch (error) {
          socket.emit("error", {
            message: error.message || "حدث خطأ أثناء إرسال قائمة الغرف",
          });
        }
      }
    });

    /** Real-Time notification system */

    // Get user notifications
    socket.on("get_notifications", async function () {
      try {
        const notifications = await Notification.find({
          recipient: socket.currentUserDecode.id,
        });
        socket.emit("notifications_updated", notifications);
      } catch (error) {
        socket.emit("error", {
          message: error.message || "حدث خطأ أثناء جلب الإشعارات",
        });
      }
    });

    // Mark notification as read
    socket.on("mark_notification_read", async function ({ notificationId }) {
      try {
        const notification = await Notification.findOneAndUpdate(
          {
            _id: notificationId,
            recipient: socket.currentUserDecode.id,
          },
          { read: true },
          { new: true }
        );

        if (!notification) {
          throw new Error("لم يتم العثور على الإشعار");
        }

        socket.emit("notification_marked_read", notification);

        // Send updated unread count
        const count = await Notification.countDocuments({
          recipient: socket.currentUserDecode.id,
          read: false,
        });
        socket.emit("unread_count_updated", { count });
      } catch (error) {
        socket.emit("error", {
          message: error.message || "حدث خطأ أثناء تحديث حالة الإشعار",
        });
      }
    });

    // Mark all notifications as read
    socket.on("mark_all_notifications_read", async function () {
      try {
        await Notification.updateMany(
          {
            recipient: socket.currentUserDecode.id,
            read: false,
          },
          { read: true }
        );

        socket.emit("all_notifications_marked_read");
        socket.emit("unread_count_updated", { count: 0 });
      } catch (error) {
        socket.emit("error", {
          message: error.message || "حدث خطأ أثناء تحديث حالة الإشعارات",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
