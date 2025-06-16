import { Component } from '@angular/core';
import { TaskManagerComponent } from './components/task-manager/task-manager.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskManagerComponent],
  template: ` <app-task-manager></app-task-manager> `,
})
export class App {
  title = 'Task Manager';
}
