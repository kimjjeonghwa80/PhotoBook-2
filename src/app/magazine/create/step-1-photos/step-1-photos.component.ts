import * as _ from 'lodash';
import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FilesService } from '../../../shared/services';

@Component({
  selector: 'app-step-1-photos',
  templateUrl: './step-1-photos.component.html',
  styleUrls: ['./step-1-photos.component.scss']
})
export class Step1PhotosComponent implements OnInit {
  errors: Array<string> =[];
  dragAreaClass: string = 'dragarea';
  @Input() projectId: number = 100;
  @Input() sectionId: number = 100;
  @Input() fileExt: string[] = ["JPG", "JPEG"];
  @Input() maxFiles: number = 100;
  @Input() maxSize: number = 5; // 5MB
  @Output() uploadStatus = new EventEmitter();

  imgSrcs: any[] = [];
  
  constructor(private fileService: FilesService) { }

  ngOnInit() {
    this.fileService.getFolder()
      .subscribe(
        success => {
          this.refreshPhotoList();
        },
        error => {
          console.log(error);
      })
  }

  onFileChange(event){
    let files = event.target.files; 
    this.saveFiles(files);
  }

  @HostListener('dragover', ['$event']) onDragOver(event) {
      this.dragAreaClass = "droparea";
      event.preventDefault();
  }

  @HostListener('dragenter', ['$event']) onDragEnter(event) {
      this.dragAreaClass = "droparea";
      event.preventDefault();
  }

  @HostListener('dragend', ['$event']) onDragEnd(event) {
      this.dragAreaClass = "dragarea";
      event.preventDefault();
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event) {
      this.dragAreaClass = "dragarea";
      event.preventDefault();
  }
  @HostListener('drop', ['$event']) onDrop(event) {   
      this.dragAreaClass = "dragarea";           
      event.preventDefault();
      event.stopPropagation();
      var files = event.dataTransfer.files;
      this.saveFiles(files);
  }

  refreshPhotoList(files = []) {
    if (files.length > 0) {
      files.forEach((file) => {
        const myReader: FileReader = new FileReader();
  
        myReader.onloadend = (e) => {
          const base64Data = myReader.result;
          this.imgSrcs.push(base64Data); 
        };
    
        myReader.readAsDataURL(file);
      })  
    } else {
      this.fileService.getFolderPhotos()
        .subscribe((res) => {
          if (parseInt(res.errNum) == 100) {

          }
        },(err) => {
            console.log(err);
        })
    }
  }

  saveFiles(files){
    this.errors = []; // Clear error
    // Validate file size and allowed extensions
    if (files.length > 0 && (!this.isValidFiles(files))) {
        this.uploadStatus.emit(false);
        return;
    }  
  
    if (files.length > 0) {
      const filesArry = _.values(files);
      this.refreshPhotoList(filesArry);

      // let formData: FormData = new FormData();
      // for (var j = 0; j < files.length; j++) {
      //   formData.append("file[]", files[j], files[j].name);
      // }
      // var parameters = {
      //   projectId: this.projectId,
      //   sectionId: this.sectionId
      // }
      const file = filesArry.shift();
      this.fileService.uploadFile(file)
        .subscribe(
          success => {
            this.uploadStatus.emit(true);
            console.log(success)
          },
          error => {
            this.uploadStatus.emit(true);
            this.errors.push(error.ExceptionMessage);
        })
    }
  }

  private isValidFiles(files){
    // Check Number of files
      if (files.length > this.maxFiles) {
          this.errors.push("Error: At a time you can upload only " + this.maxFiles + " files");
          return;
      }
      this.isValidFileExtension(files);
      return this.errors.length === 0;
  }

  private isValidFileExtension(files){
      // Make array of file extensions
        var extensions = (this.fileExt)
                        .map(function (x) { return x.toLocaleUpperCase().trim() });

        for (var i = 0; i < files.length; i++) {
            // Get file extension
            var ext = files[i].name.toUpperCase().split('.').pop() || files[i].name;
            // Check the extension exists
            var exists = extensions.includes(ext);
            if (!exists) {
                this.errors.push("Error (Extension): " + files[i].name);
            }
            // Check file size
            this.isValidFileSize(files[i]);
        }
  }


  private isValidFileSize(file) {
        var fileSizeinMB = file.size / (1024 * 1000);
        var size = Math.round(fileSizeinMB * 100) / 100; // convert upto 2 decimal place
        if (size > this.maxSize)
            this.errors.push("Error (File Size): " + file.name + ": exceed file size limit of " + this.maxSize + "MB ( " + size + "MB )");
  }
}
