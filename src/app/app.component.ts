import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HeaderComponent,SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  // title = 'licencePro';
  protected readonly title = signal('licence');

  constructor(private router: Router) {}

  isLoginRoute(): boolean {
    return this.router.url.startsWith('/login');
  }
}
