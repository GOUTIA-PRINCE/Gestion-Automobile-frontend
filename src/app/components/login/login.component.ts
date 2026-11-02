import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = signal(false);
  isResetOpen = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  login(): void {
    if (!this.email || !this.password) {
      this.error.set('Email et mot de passe requis');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: response => {
        this.authService.setSession(response);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.error.set(err?.error?.message || err?.message || 'Connexion impossible');
        this.isLoading.set(false);
      }
    });
  }

  openReset(): void {
    this.isResetOpen.set(true);
  }
}
