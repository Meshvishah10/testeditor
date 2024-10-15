import { AppSettingsService } from 'src/app/services/app-settings.service';
import * as crypto from 'crypto-js'; 
import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root'
  })
export class CommonService {
    // getting pubkey from app-SettingsService.service.ts file
    pkey:any=AppSettingsService.pubkey().split('v1s');
    // convert in utf8 format for encryption and decryption
    pubkey:any= crypto.enc.Utf8.parse(this.pkey[0]);
    ivarray:any=crypto.enc.Utf8.parse(AppSettingsService.ivarray());
    // getting apiurl from app-SettingsService.service.ts file
    apiUrl:any=AppSettingsService.apiUrl();

    // Function is used for encrypt json
    Encrypt(text:any) {
        const uuid = uuidv4().replace(/-/g, '');
        let firstencrypt = crypto.AES.encrypt(JSON.stringify(text),crypto.enc.Utf8.parse(uuid),{iv:this.ivarray}).toString();
        let connect = uuid+'###'+firstencrypt;
        return crypto.AES.encrypt(connect,this.pubkey,{iv:this.ivarray}).toString();
      }
      
    // Function is used for decrypt json
     Decrypt(text:any) {
        let data = crypto.AES.decrypt(text,this.pubkey,{iv:this.ivarray}).toString(crypto.enc.Utf8)
        let finalstr = data.split('###');
        return JSON.parse(crypto.AES.decrypt(finalstr[1],crypto.enc.Utf8.parse(finalstr[0]),{iv:this.ivarray}).toString(crypto.enc.Utf8));
      }

      // Function is used for encrypt text
       AESEncrypt_text(text:string) {
        const uuid = uuidv4().replace(/-/g, '');
        let encryptstr = crypto.AES.encrypt(text,crypto.enc.Utf8.parse(uuid),{iv:this.ivarray}).toString();
        let connect = uuid+'###'+encryptstr;
        return crypto.AES.encrypt(connect,this.pubkey,{iv:this.ivarray}).toString();
      }

      ApiUrl(){
        return this.apiUrl;
      }
      
      // Function is used for decrypt text
     AESDecrypt_text(text:any) {
      let data = crypto.AES.decrypt(text,this.pubkey,{iv:this.ivarray}).toString(crypto.enc.Utf8)
      let finalstr = data.split('###');
      return crypto.AES.decrypt(finalstr[1],crypto.enc.Utf8.parse(finalstr[0]),{iv:this.ivarray}).toString(crypto.enc.Utf8)
      }

      // Function is used for encrypt Id Paramaters
      EncryptID(text:any){
        let data=crypto.AES.encrypt(text,this.pubkey,{iv:this.ivarray}).toString();
        return data.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, 'e4Q3u2A1l');
      }

      // Function is used for decrypt Id parameters
      DecryptID(text:any){
        let data=text.toString().replace(/\-/g, '+').replace(/\_/g, '/').replace(/e4Q3u2A1l/g, '=');
        return crypto.AES.decrypt(data, this.pubkey ,{iv:this.ivarray}).toString(crypto.enc.Utf8)
      }
}