import { QuestionsService } from './../shared/questions.service';
import { Component, OnInit } from '@angular/core';
import { Folder } from '../shared/folder.model';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css']
})
export class FolderComponent implements OnInit {
  folders: Folder[] = [];

  constructor(private questionService: QuestionsService) { }

  ngOnInit() {
    this.folders = this.questionService.getAllFolders();
  }

}
