import {Component, EventEmitter, input, Output} from '@angular/core';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {NewListingPicture} from "../../../model/picture.model";

// Stable ids for tracking; file names can repeat (e.g. "image.jpg" from different folders).
let nextPictureId = 0;

@Component({
  selector: 'app-picture-step',
  standalone: true,
  imports: [FontAwesomeModule, InputTextModule, ButtonModule],
  templateUrl: './picture-step.component.html',
  styleUrl: './picture-step.component.scss'
})
export class PictureStepComponent {

  pictures = input.required<Array<NewListingPicture>>();

  @Output()
  picturesChange = new EventEmitter<Array<NewListingPicture>>();

  @Output()
  stepValidityChange = new EventEmitter<boolean>();

  extractFileFromTarget(target: EventTarget | null) {
    const htmlInputTarget = target as HTMLInputElement;
    if (target === null || htmlInputTarget.files === null) {
      return null;
    }
    return htmlInputTarget.files;
  }

  onUploadNewPicture(target: EventTarget | null) {
    const picturesFileList = this.extractFileFromTarget(target);
    if(picturesFileList !== null) {
      const addedPictures = new Array<NewListingPicture>();
      for(let i = 0 ; i < picturesFileList.length; i++) {
        const picture = picturesFileList.item(i);
        if (picture !== null) {
          addedPictures.push({
            id: nextPictureId++,
            file: picture,
            urlDisplay: URL.createObjectURL(picture)
          });
        }
      }
      this.updatePictures([...this.pictures(), ...addedPictures]);
      // Allow selecting the same file again after deleting it.
      (target as HTMLInputElement).value = "";
    }
  }

  onTrashPicture(pictureToDelete: NewListingPicture) {
    URL.revokeObjectURL(pictureToDelete.urlDisplay);
    this.updatePictures(this.pictures().filter(picture => picture.id !== pictureToDelete.id));
  }

  private updatePictures(pictures: Array<NewListingPicture>) {
    this.picturesChange.emit(pictures);
    this.stepValidityChange.emit(pictures.length >= 5);
  }
}
