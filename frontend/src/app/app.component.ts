import { Component, OnInit } from '@angular/core';
import { UserService, User } from './user.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],  // <-- ici CommonModule
  templateUrl: './app.html',
})
export class AppComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(
      data => this.users = data,
      err => console.error('Erreur API:', err)
    );
  }
}

