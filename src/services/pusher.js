import Pusher from "pusher-js";

const BASE_URL = "https://gradback.neotonicglobal.com";

// ✅ منع الإنشاء المتكرر
let pusherInstance = null;

const getPusher = () => {
  if (!pusherInstance) {
    pusherInstance = new Pusher("5fc000b382a90f691def", {
      cluster: "eu",
      authEndpoint: `${BASE_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          Accept: "application/json",
        },
      },
    });
  }
  return pusherInstance;
};

const pusher = getPusher();

export default pusher;

export const getUserChannel = (userId) => {
  return `private-App.Models.User.${userId}`;
};

export const getSocketId = () => {
  return pusher.connection.socket_id;
};
