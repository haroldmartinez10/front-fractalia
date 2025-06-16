import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">
          Task Manager
        </h1>

        <!-- Formulario para crear nueva tarea -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Add New Task</h2>
          <form (ngSubmit)="addTask()" class="space-y-4">
            <div>
              <input
                type="text"
                [(ngModel)]="newTask.title"
                name="title"
                placeholder="Task title"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <textarea
                [(ngModel)]="newTask.description"
                name="description"
                placeholder="Task description"
                rows="3"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              [disabled]="!newTask.title || !newTask.description || isLoading()"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              {{ isLoading() ? 'Adding...' : 'Add Task' }}
            </button>
          </form>
        </div>

        <!-- Lista de tareas -->
        <div class="space-y-4">
          @if (tasks().length === 0) {
          <div class="text-center py-12">
            <p class="text-gray-500 text-lg">
              No tasks yet. Create your first task!
            </p>
          </div>
          } @else { @for (task of tasks(); track task.id) {
          <div
            class="task-card bg-white rounded-lg shadow-md p-6"
            [class.completed-task]="task.completed"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <input
                    type="checkbox"
                    [checked]="task.completed"
                    (change)="toggleTask(task)"
                    class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <h3 class="task-title text-lg font-semibold text-gray-800">
                    {{ task.title }}
                  </h3>
                </div>
                <p class="text-gray-600 ml-8">{{ task.description }}</p>
              </div>
              <button
                (click)="deleteTask(task.id!)"
                class="ml-4 text-red-600 hover:text-red-800 transition duration-200"
                title="Delete task"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
          } }
        </div>
      </div>
    </div>
  `,
})
export class TaskManagerComponent implements OnInit {
  tasks = signal<Task[]>([]);
  isLoading = signal(false);

  newTask: Task = {
    title: '',
    description: '',
    completed: false,
  };

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading.set(true);
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading.set(false);
      },
    });
  }

  addTask() {
    if (!this.newTask.title || !this.newTask.description) return;

    this.isLoading.set(true);
    this.taskService.createTask(this.newTask).subscribe({
      next: (task) => {
        this.tasks.update((tasks) => [...tasks, task]);
        this.newTask = { title: '', description: '', completed: false };
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error adding task:', error);
        this.isLoading.set(false);
      },
    });
  }

  toggleTask(task: Task) {
    const updatedTask = { ...task, completed: !task.completed };
    this.taskService.updateTask(task.id!, updatedTask).subscribe({
      next: (updated) => {
        this.tasks.update((tasks) =>
          tasks.map((t) => (t.id === task.id ? updated : t))
        );
      },
      error: (error) => {
        console.error('Error updating task:', error);
      },
    });
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks.update((tasks) => tasks.filter((t) => t.id !== id));
      },
      error: (error) => {
        console.error('Error deleting task:', error);
      },
    });
  }
}
