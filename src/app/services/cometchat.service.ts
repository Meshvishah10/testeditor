import { CometChat } from '@cometchat-pro/chat';
import { Injectable } from '@angular/core';
import { AppSettingsService } from './app-settings.service';

@Injectable({
  providedIn: 'root',
})
export class CometChatService {
  appId: string = AppSettingsService.AppId();
  appRegion: string = AppSettingsService.appRegion();
  authKey: string = AppSettingsService.authKey();
  widgetId: string = AppSettingsService.widgetId();

  async CC_Initialize() {
    try {
      const data = await CometChat.init(
        this.appId, // Replace with your CometChat App ID
        new CometChat.AppSettingsBuilder()
          .setRegion(this.appRegion) // Replace with your CometChat region
          .subscribePresenceForAllUsers()
          .build()
      );
      return { data };
    } catch (error: any) {
      return { error };
    }
  }

  async CC_LoginUser({ userId }: any) {
    try {
      const data = await CometChat.login(userId, this.authKey);
      return { data };
    } catch (error: any) {
      return { error };
    }
  }

  async CC_LogOutUser() {
    try {
      const data = await CometChat.logout();
      return { data };
    } catch (error: any) {
      return { error };
    }
  }

  async CC_GetUser({ userId }: any) {
    try {
      const data = await CometChat.getUser(userId);
      return { data };
    } catch (error: any) {
      return { error };
    }
  }

  async CC_CreateUser({ userId, userName, userAvatar }: any) {
    const user = new CometChat.User(userId);
    user.setName(userName);
    user.setAvatar(userAvatar);
    try {
      const data = await CometChat.createUser(user, this.authKey);
      return { data };
    } catch (error: any) {
      return { error };
    }
  }

  async CC_UpdateUser({ userId, userName, userAvatar }: any) {
    try {
      const user = new CometChat.User(userId);
      user.setName(userName);
      user.setAvatar(userAvatar);
      const data = await CometChat.updateUser(user, this.authKey);
      return { data };
    } catch (error: any) {
      return { error };
    }
  }
}
