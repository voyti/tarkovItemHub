import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-parameters-info-dialog',
  templateUrl: './parameters-info-dialog.component.html',
  styleUrls: ['./parameters-info-dialog.component.scss']
})
export class ParametersInfoDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ParametersInfoDialogComponent>, @Inject(MAT_DIALOG_DATA) public data) {

  }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}