import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IdentityService } from '../../../auth/service/identity.service';


@Component({
  selector: 'prestamo-page',
  imports: [RouterLink,RouterLinkActive,RouterOutlet],
  templateUrl: './prestamo-page.html',
  styleUrl : './prestamo-page.css'
})
export class PrestamoPage implements OnInit, OnDestroy {
  readonly sidebarOpen = signal(false);
  readonly clock = signal('');
  private timer?: ReturnType<typeof setInterval>;
  private router = inject(Router);
  private auth = inject(IdentityService);


  ngOnInit(): void {
    this.updateClock();
    this.timer = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private updateClock(): void {
    const now = new Date();
    this.clock.set(now.toString().replace(/GMT.*/, '') + '(hora estándar de Chile)');
  }

  openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
