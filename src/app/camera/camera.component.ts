import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { element } from 'protractor';

@Component({
  selector: 'camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
  @ViewChild("video")
  public video: ElementRef;

  @ViewChild("canvas")
  public canvas: ElementRef;

  @Output()
  public loFiveSelfie = new EventEmitter<WebcamImage>();
  public deviceId: string;
  public showCamera = false;
  public allowDeviceSwitch: boolean;
  public multipleWebcamsAvailable: boolean;
  public videoOptions: MediaTrackConstraints = {
   width: {ideal: 1024},
   height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();
  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
    .then((mediaDevices: MediaDeviceInfo[]) => {
    this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
    });
  }

  public toggleCamera(): void {
    this.showCamera = !this.showCamera;
  }

  public handleInitError(error: WebcamInitError): void {
  this.errors.push(error);
  }

  // TODO: PICO Screenshot Service

  public captures: Array<any>;

  public constructor() {
      this.captures = [];
  }

  public ngAfterViewInit() {
      if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
              this.video.nativeElement.src = window.URL.createObjectURL(stream);
              this.video.nativeElement.play();
          });
      }
  }

  public capture() {
      var context = this.canvas.nativeElement.getContext("2d").drawImage(this.video.nativeElement, 0, 0, 640, 480);
      this.captures.push(this.canvas.nativeElement.toDataURL("image/png"));
  }


  // TODO: List of available devices for Video


  public showNextWebcam(directionOrDeviceId: boolean|string): void {
  // true => move forward through devices
  // false => move backwards through devices
  // string => move to device with given deviceId
  this.nextWebcam.next(directionOrDeviceId);
  }

  public cameraWasSwitched(deviceId: string): void {
  console.log('active device: ' + deviceId);
  this.deviceId = deviceId;
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
  return this.nextWebcam.asObservable();
  }
}
