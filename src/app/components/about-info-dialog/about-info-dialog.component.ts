import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-about-info-dialog',
  templateUrl: './about-info-dialog.component.html',
  styleUrls: ['./about-info-dialog.component.scss']
})
export class AboutInfoDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AboutInfoDialogComponent>, @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
