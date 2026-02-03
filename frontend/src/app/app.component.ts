import { Component, OnInit } from '@angular/core';
import { UserService, User } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <h1>Application DevOps</h1>
    <h2>Liste des utilisateurs</h2>
    <ul>
      <li *ngFor="let user of users">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
    <p *ngIf="users.length === 0">Aucun utilisateur trouvé.</p>
  `,
  styleUrls: ['./app.component.css'],
  providers: [UserService]  // facultatif si déjà "providedIn: root"
})
export class AppComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUsers().subscribe({
      next: data => this.users = data,
      error: err => console.error('Erreur API:', err)
    });
  }
}

