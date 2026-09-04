import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared components/header/header.component';
import { FooterComponent } from './shared components/footer/footer.component';
import { HomePageFooterComponent } from './shared components/home-page-footer/home-page-footer.component';
import { ToastComponent } from './shared components/toast/toast.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    HeaderComponent,
    FooterComponent,
    HomePageFooterComponent,
    ToastComponent
  ]
})
export class AppComponent implements OnInit {
  title = 'tarbiyatul';
  isHome = false;
  isStudentPortal = false;
  isParentPortal = false;
  isTeacherPortal = false;
  isTutoringPortal = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadExternalScript();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Dynamically toggle footer layout on the home route
        const url = event.urlAfterRedirects;
        this.isHome = url === '/' || url === '' || url.split('?')[0] === '/';
        this.isStudentPortal = url.startsWith('/student');
        this.isParentPortal = url.startsWith('/parent');
        this.isTeacherPortal = url.startsWith('/teacher');
        this.isTutoringPortal = url.startsWith('/tutoring');

        // Scroll to top on page change
        window.scrollTo(0, 0);
        const portalMains = document.querySelectorAll('.portal-main');
        portalMains.forEach(el => {
          el.scrollTop = 0;
        });

        // Trigger AOS refresh & scroll event so images and animations render immediately without needing manual scroll
        setTimeout(() => {
          if (typeof (window as any).AOS !== 'undefined') {
            (window as any).AOS.refreshHard();
          }
          window.dispatchEvent(new Event('scroll'));
          window.dispatchEvent(new Event('resize'));
        }, 80);

        setTimeout(() => {
          if (typeof (window as any).AOS !== 'undefined') {
            (window as any).AOS.refresh();
          }
          window.dispatchEvent(new Event('scroll'));
        }, 300);
      }
    });
  }

  loadExternalScript() {
    if (document.querySelector('script[src="assets/js/main.js"]')) {
      return;
    }
    const scriptElement = document.createElement('script');
    scriptElement.src = 'assets/js/main.js';
    scriptElement.onload = () => {
      if (typeof (window as any).AOS !== 'undefined') {
        (window as any).AOS.refreshHard();
      }
    };
    document.body.appendChild(scriptElement);
  }
}
