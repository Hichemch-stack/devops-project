import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(App, {
  providers: [
    provideHttpClient() // Permet à toute l'application d'utiliser HttpClient
  ]
})
.catch(err => console.error(err));
