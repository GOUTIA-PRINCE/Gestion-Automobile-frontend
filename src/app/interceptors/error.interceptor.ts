import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Intercepteur HTTP global pour gérer les erreurs de manière centralisée
 * 
 * Usage: Ajouter à app.config.ts dans le array de providers
 * 
 * ```typescript
 * import { HTTP_INTERCEPTORS } from '@angular/common/http';
 * import { ErrorInterceptor } from './interceptors/error.interceptor';
 * 
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     // ... autres providers
 *     { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
 *   ]
 * };
 * ```
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue';

        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Erreur: ${error.error.message}`;
          console.error('Client Error:', error.error);
        } else {
          // Erreur côté serveur
          console.error('Server Error:', error);

          // Mapper les codes d'erreur HTTP courants
          switch (error.status) {
            case 0:
              errorMessage = 'Impossible de joindre le serveur. Vérifiez votre connexion.';
              break;
            case 400:
              errorMessage = `Erreur de requête: ${error.error?.message || 'Données invalides'}`;
              break;
            case 401:
              errorMessage = 'Non authentifié. Veuillez vous connecter.';
              // Rediriger vers login si nécessaire
              break;
            case 403:
              errorMessage = 'Accès refusé. Vous n\'avez pas les permissions.';
              break;
            case 404:
              errorMessage = 'Ressource non trouvée.';
              break;
            case 409:
              errorMessage = 'Conflit: ${error.error?.message || 'Cette ressource existe déjà'}`;
              break;
            case 500:
              errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
              break;
            case 503:
              errorMessage = 'Serveur indisponible. Veuillez réessayer plus tard.';
              break;
            default:
              errorMessage = `Erreur ${error.status}: ${error.error?.message || 'Veuillez réessayer'}`;
          }
        }

        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: request.url,
          method: request.method
        });

        return throwError(() => ({
          status: error.status,
          message: errorMessage,
          error: error.error
        }));
      })
    );
  }
}

/**
 * Alternative simplifiée (sans intercepteur) :
 * Vous pouvez aussi gérer les erreurs directement dans le service comme déjà fait
 */
