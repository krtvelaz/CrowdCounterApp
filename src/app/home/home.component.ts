import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { environment } from 'src/environments/environment';
import { AlertController, ToastController } from '@ionic/angular';
import write_blob from 'capacitor-blob-writer';

const APP_DIRECTORY = Directory.Documents;
const DIRECTORY_IMAGES = '/insiteapp/images';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('canvacapturing', { static: false }) canvacapturing!: ElementRef;
  @ViewChild('videocapturing', { static: false }) videocapturing!: ElementRef;
  imageElementSrc: string = '';
  imageBlob: any;
  captureInterval: number = 5;
  isCapturing: boolean = false;
  isSyncing: boolean = false;
  photoCount: number = 0;
  photoErrorCount: number = 0;
  pendingImages: number = 0;
  captureIntervalId: any;
  eventId: number = 1;
  cameraId: number = 1;
  tokenAuth: string;
  apiUrl: string;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.tokenAuth = environment.tokenAuth;
    this.apiUrl = environment.apiUrl;
  }

  ngOnInit() {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          this.videocapturing.nativeElement.srcObject = stream;
        })
        .catch((error) => {
          console.log("Error al obtener el stream de la cámara: ", error);
        });
    }
    if (!this.initializeStorage(DIRECTORY_IMAGES)) {
      this.alertController.create({
        header: 'Error',
        message: 'No se pudo crear el directorio de almacenamiento',
        buttons: ['OK']
      }).then(alert => alert.present());
    }
  }

  toggleCamera() {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const currentCamera = this.videocapturing.nativeElement.srcObject.getTracks()[0];
        const currentIndex = videoDevices.findIndex(device => device.deviceId === currentCamera.getSettings().deviceId);
        const nextIndex = (currentIndex + 1) % videoDevices.length;
        const nextCamera = videoDevices[nextIndex];
        currentCamera.stop();
        navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: nextCamera.deviceId } }, audio: false })
          .then((stream) => {
            this.videocapturing.nativeElement.srcObject = stream;
          })
          .catch((error) => {
            console.log("Error al cambiar la cámara: ", error);
          });
      })
      .catch(error => {
        console.log("Error al enumerar dispositivos: ", error);
      });
  }
  getFormatingDate() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0')
    const fechaEnFormatoDeseado = `${año}${mes}${dia}_${hora}${minutos}${segundos}`;
    return fechaEnFormatoDeseado;
  }

  initializeStorage(path: string): Promise<boolean> {
    return Filesystem.readdir({
      path: path,
      directory: APP_DIRECTORY
    }).then(_ => {
      return true;
    }).catch(_ => {
      return Filesystem.mkdir({
        path: path,
        directory: APP_DIRECTORY,
        recursive: true
      }).then(_ => {
        return true;
      });
    });
  }
  async startCapture() {
    try {
      this.isCapturing = true;
      this.photoCount = 0;
      this.captureIntervalId = setInterval(() => {
        this.takePhotoBrowser();
      }, this.captureInterval * 1000);
    } catch (error) {
      console.log("🚀 ~ file: home.component.ts:104 ~ HomeComponent ~ startCapture ~ error:", error)
      this.alertController.create({
        header: 'Error',
        message: 'No se pudo iniciar la captura de imágenes',
        buttons: ['OK']
      }).then(alert => alert.present());
    }

  }
  stopCapture() {
    this.isCapturing = false;
    clearInterval(this.captureIntervalId);
  }

  async takePhotoBrowser() {
    const width = this.videocapturing.nativeElement.videoWidth;
    const height = this.videocapturing.nativeElement.videoHeight;
    const context = this.canvacapturing.nativeElement.getContext('2d');

    this.canvacapturing.nativeElement.width = width;
    this.canvacapturing.nativeElement.height = height;
    context.drawImage(this.videocapturing.nativeElement, 0, 0, width, height);

    const photoBlob:Blob = await new Promise(resolve=>this.canvacapturing.nativeElement.toBlob(resolve,'image/png', 1));
    this.imageElementSrc=URL.createObjectURL(photoBlob);
    this.imageBlob=photoBlob;
    this.sendImages(photoBlob);
  }

  async sendImages(photoBlob:Blob) {
    const dateFormatted = this.getFormatingDate();
    const namePhoto = `${this.eventId}_${this.cameraId}_${dateFormatted}.png`;
    //send imagefile to api
    const formData = new FormData();
    formData.append('image', photoBlob, namePhoto);
    formData.append('token', this.tokenAuth);
    formData.append('eventId', this.eventId.toString());
    formData.append('cameraId', this.cameraId.toString());
    
    try {
      const response = await fetch(`${this.apiUrl}saveimg.php`
        , {
          method: 'POST',
          headers: {
            // 'Content-Type': 'multipart/form-data'
          },
          body: formData
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        this.photoCount++;
    } catch (error) {
      await write_blob({
        directory: APP_DIRECTORY,
        path: `${DIRECTORY_IMAGES}/${namePhoto}`,
        blob: photoBlob,
        on_fallback(error: any) {
          console.log("🚀 ~ file: home.component.ts:171 ~ HomeComponent ~ sendImages ~ error:", error);
        }
      });
      this.photoErrorCount++;
    }
  }
 
  async syncError() {
    this.isSyncing = true;
    const files = await Filesystem.readdir({
      path: `${DIRECTORY_IMAGES}/`,
      directory: APP_DIRECTORY
    });
    this.pendingImages = files.files.length;
  
    for (let file of files.files) {
      try {
        const fileData:any = await Filesystem.readFile({
          path: `${DIRECTORY_IMAGES}/${file.name}`,
          directory: APP_DIRECTORY,
        });
        const rawData = atob(fileData.data);
        const blob = new Blob([rawData], { type: 'image/png' });
  
        const eventId = file.name.split('_')[0];
        const cameraId = file.name.split('_')[1];
        const formData = new FormData();
        formData.append('image', blob, file.name);
        formData.append('token', this.tokenAuth);
        formData.append('eventId', eventId);
        formData.append('cameraId', cameraId);
  
        const response = await fetch(`${this.apiUrl}saveimg.php`, {
          method: 'POST',
          body: formData
        });
  
        if (response.status === 201) {
          await Filesystem.deleteFile({
            path: `${DIRECTORY_IMAGES}/${file.name}`,
            directory: APP_DIRECTORY
          });
          this.pendingImages--;
        } else {
          console.error(`Failed to upload ${file.name}. Status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error processing ${file.name}: ${error}`);
      }
    }
  
    this.isSyncing = false;
  }
  
}
