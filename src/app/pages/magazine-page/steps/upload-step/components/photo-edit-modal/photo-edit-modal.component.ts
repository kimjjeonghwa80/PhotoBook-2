import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DeleteConfirmModalComponent } from '../delete-confirm-modal/delete-confirm-modal.component';
import { UploadStateService } from '../../services/upload-state.service';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { Mood } from '@photobook/core/models/mood';

@Component({
  selector: 'pb-photo-edit-modal',
  templateUrl: './photo-edit-modal.component.html',
  styleUrls: ['./photo-edit-modal.component.scss']
})
export class PhotoEditModalComponent implements OnInit {

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild(ImageCropperComponent) cropper: ImageCropperComponent;

  currentIndex = 0;

  originbase64Image: any = '';
  tempbase64Image: any = '';
  cropped64Image: any = '';

  rotate = 0;
  isSliding = false;
  tempCrop = {x1: 0, y1: 0, x2: 0, y2: 0};

  cropRatio = 4 / 3;
  mood: Mood = new Mood();

  constructor(
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<DeleteConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private uploadStateService: UploadStateService,
  ) { }

  ngOnInit() {
    this.currentIndex = this.data.index;
    this.readImageAsBase64(this.data.file.url);
    if (this.data.file.mood) {
      this.mood = JSON.parse(JSON.stringify(this.data.file.mood));
    } else {
      this.mood = new Mood();
    }
  }

  async readImageAsBase64(fileUrl) {
    this.originbase64Image = await this.uploadStateService.readUrlAsBase64(fileUrl);
    this.tempbase64Image = this.originbase64Image;
  }

  async rotateImage(deg) {
    const img = new Image();
    img.src = this.originbase64Image;
    const canvas = (<HTMLCanvasElement>this.canvas.nativeElement);
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext('2d');
    context.translate(img.width / 2, img.height / 2);
    context.clearRect(-2000, -2000, 5000, 5000);
    context.save();
    context.rotate(deg * Math.PI / 180);
    context.drawImage(img, -img.width / 2, -img.height / 2);
    context.restore();
    this.tempbase64Image = canvas.toDataURL();
  }

  imageCropped(image: string) {
    this.cropped64Image = image;
    this.drawMood();
  }
  imageLoaded(e) {
  }

  slideImage(value) {
    this.currentIndex += value;
    const file = this.uploadStateService.getFileByIndex(this.currentIndex);
    this.readImageAsBase64(file.url);
  }

  sliding(e) {
    this.isSliding = true;
    this.rotate = e.value;
  }

  rotateChange(e) {
    this.isSliding = false;
    this.rotateImage(this.rotate);
  }

  changeMood(e) {
    this.mood = e;
    this.drawMood();
  }

  drawMood() {
    const cropperEl = (<any>this.cropper).elementRef.nativeElement.getElementsByClassName('cropper')[0];
    const moodEl = document.getElementById('pb-mood-text');

    if (moodEl) {
      moodEl.innerHTML = this.uploadStateService.getMoodHtml(this.mood);
    } else {
      const moodElement = document.createElement('div');
      moodElement.id = 'pb-mood-text';
      moodElement.innerHTML = this.uploadStateService.getMoodHtml(this.mood);
      cropperEl.append(moodElement);
    }
  }

  async save() {
    const res = await this.uploadStateService.uploadEdited(this.data.file, this.cropped64Image).toPromise();
    await this.uploadStateService.saveMood(res, this.mood);
    this.dialogRef.close();
  }
}