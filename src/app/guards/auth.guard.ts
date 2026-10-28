import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const permissions = route.data?.['permissions'] as string[] | undefined;
  if (permissions?.length && !auth.hasAnyPermission(permissions)) {
    return router.createUrlTree(['/dashboard']);
  }

  const excludedTypes = route.data?.['excludedTypes'] as string[] | undefined;
  if (excludedTypes?.includes(auth.currentUser()?.typeUtilisateur ?? '')) {
    return router.createUrlTree(['/missions']);
  }

  return true;
};
