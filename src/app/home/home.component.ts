import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

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
  photoCount: number = 0;
  photoErrorCount: number = 0;
  captureIntervalId: any;
  eventId: number = 1;
  cameraId: number = 1;
  constructor() { }

  ngOnInit() {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          this.videocapturing.nativeElement.srcObject = stream;
          console.log("🚀 ~ file: home.component.ts:23 ~ HomeComponent ~ .then ~ stream: capturando")
        })
        .catch((error) => {
          console.log("Error al obtener el stream de la cámara: ", error);
        });
    }
  }

  startCapture() {
    this.isCapturing = true;
    this.photoCount = 0;

    this.captureIntervalId = setInterval(() => {
      this.takePhotoBrowser();
    }, this.captureInterval * 1000);
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
    this.canvacapturing.nativeElement.toBlob(async (blob: any) => {
      this.imageBlob = blob;
      const imageUrl = URL.createObjectURL(blob);
      this.imageElementSrc = imageUrl;
      this.photoCount++;
    }, 'image/png', 1);
    // this.sendImages();
  }
  async takePhotoCapacitor() {

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });
    let imageUrl = image.webPath;
    this.imageElementSrc = imageUrl ?? '';
    this.photoCount++;
  }

  async sendImages() {
    //envia la imagen a la url de la api con la fecha de captura y el id de la camara, si la respuesta no es 200, guarda la imagen en el dispositivo con el nombre {camaraid}-{evento}-{fechacaptura}.png
    const eventId = this.eventId;
    const cameraId = this.cameraId;
    const date = new Date();
    const dateFormatted = `${date.getDate()}${date.getMonth()}${date.getFullYear()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
    try {
      const apiUrl = 'http://localhost:3000/getFoto.php?token=123456789';
      //send imagefile to api
      const formData = new FormData();
      formData.append('image', this.imageBlob, `crowdcounter-${cameraId}-${eventId}-${dateFormatted}.png`);

      const response = await fetch(`${apiUrl}&eventId=${eventId}&cameraId=${cameraId}&date=${dateFormatted}`
        , {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: formData
        });
    } catch (error) {
      const result = await Filesystem.writeFile({
        path: `imagesCrowdCounter/crowdcounter-${cameraId}-${eventId}-${dateFormatted}.png`,
        data: this.imageBlob,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
      this.photoErrorCount++;

    }
  }
  async syncError() {
    //leer los archivos guardados en el dispositivo y enviarlos a la api
    // const files = await Filesystem.readdir({
    //   path: 'imagesCrowdCounter',
    //   directory: Directory.Data
    // });
    // const apiUrl = 'http://localhost:3000/getFoto.php?token=123456789';
    // for (const file of files.files) {
    //   const fileData: any = await Filesystem.readFile({
    //     path: `imagesCrowdCounter/${file}`,
    //     directory: Directory.Data,
    //     encoding: Encoding.UTF8
    //   });
    //   const date = new Date();
    //   const dateFormatted = file.name.split('-')[3].split('.')[0];
    //   const cameraId = file.name.split('-')[1];
    //   const eventId = file.name.split('-')[2];
    //   const formData = new FormData();
    //   formData.append('image', fileData, file.name);
    //   const response = await fetch(`${apiUrl}&eventId=${eventId}&cameraId=${cameraId}&date=${dateFormatted}`
    //     , {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       body: formData
    //     });
    //   if (response.status === 200) {
    //     await Filesystem.deleteFile({
    //       path: `imagesCrowdCounter/${file}`,
    //       directory: Directory.Data
    //     });
    //   }
    // }
  }
}
