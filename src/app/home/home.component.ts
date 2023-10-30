import { Component, ElementRef, OnInit,ViewChild } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('canvacapturing', { static: false }) canvacapturing!: ElementRef;
  @ViewChild('videocapturing', { static: false }) videocapturing!: ElementRef;
  imageElementSrc: string = '';
  captureInterval: number = 20; // Intervalo de captura en segundos
  isCapturing: boolean = false;
  photoCount: number = 0;
  captureIntervalId: any;
  constructor() { }

  ngOnInit() { 
    if(navigator.mediaDevices.getUserMedia){
      navigator.mediaDevices.getUserMedia({video:true})
      .then((stream)=>{
        this.videocapturing.nativeElement.srcObject = stream;
      })
      .catch((error)=>{
        console.log("Error al obtener el stream de la cámara: ", error);
      });
    }
  }

  startCapture() {
    this.isCapturing = true;
    this.photoCount = 0;

    this.captureIntervalId = setInterval(() => {
      this.takePhoto();
    }, this.captureInterval * 1000);
  }

  stopCapture() {
    this.isCapturing = false;
    clearInterval(this.captureIntervalId);
  }

  async takePhoto(){
    const width = this.videocapturing.nativeElement.videoWidth;
    const height = this.videocapturing.nativeElement.videoHeight;
    const context = this.canvacapturing.nativeElement.getContext('2d');

    this.canvacapturing.nativeElement.width = width;
    this.canvacapturing.nativeElement.height = height;
    context.drawImage(this.videocapturing.nativeElement, 0, 0, width, height);
    this.canvacapturing.nativeElement.toBlob(async (blob:any) => {
      const imageUrl = URL.createObjectURL(blob);
      this.imageElementSrc = imageUrl;
      this.photoCount++;
    }, 'image/jpeg', 1);


    // const image = await Camera.getPhoto({
    //   quality: 90,
    //   allowEditing: false,
    //   resultType: CameraResultType.Uri,
    // });
    // let imageUrl = image.webPath;
    // this.imageElement.nativeElement.src = imageUrl;
    // this.photoCount++;
    }
  }
