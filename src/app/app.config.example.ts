import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS, withXsrfConfiguration } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { ErrorInterceptor } from './interceptors/error.interceptor';

/**
 * Configuration principale de l'application Angular
 * 
 * Cette configuration inclut:
 * - Le routeur
 * - Le client HTTP avec intercepteurs
 * - La gestion des erreurs globales
 * - Configuration XSRF
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    
    // ─── HTTP Configuration ────────────────────────────────────────────
    provideHttpClient(
      // Configuration XSRF (protection CSRF)
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      })
    ),
    
    // ─── Intercepteurs HTTP ────────────────────────────────────────────
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    
    // ─── Autres providers selon vos besoins ────────────────────────────
    // { provide: DatePipe, useValue: new DatePipe('fr-FR') }
  ]
};

/**
 * Notes importantes:
 * 
 * 1. INTERCEPTEURS:
 *    Les intercepteurs s'exécutent dans l'ordre dans lequel ils sont déclarés.
 *    Vous pouvez en ajouter plusieurs avec `multi: true`
 * 
 * 2. GESTION D'ERREURS:
 *    L'ErrorInterceptor gère les erreurs HTTP globalement
 *    Mais vous pouvez aussi gérer les erreurs localement avec `.subscribe(error:...)`
 * 
 * 3. XSRF:
 *    Configuration pour la sécurité CSRF
 *    Automatiquement géré par Angular
 * 
 * 4. PROVIDERS:
 *    - Singleton services (partagés dans l'app)
 *    - Tokens d'injection
 *    - Intercepteurs
 */
