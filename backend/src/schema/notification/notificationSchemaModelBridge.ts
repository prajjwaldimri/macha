// When any new notification is added to the database the below method is called along with the data
import { pushNotification } from "./notificationSubscription";

export const newNotificationCallback = (data: any) => {
  pushNotification(data.fullDocument);
};
