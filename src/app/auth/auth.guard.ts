import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    let token = localStorage.getItem('accessToken');
    if (token == undefined || token == null || token == '') {
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }
    return true;
  }
}
