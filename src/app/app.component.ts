import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared components/header/header.component';
import { FooterComponent } from './shared components/footer/footer.component';
import { HomePageFooterComponent } from './shared components/home-page-footer/home-page-footer.component';

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
    HomePageFooterComponent
  ]
})
export class AppComponent implements OnInit {
  title = 'tarbiyatul';
  isHome = false;
  isStudentPortal = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Dynamically toggle footer layout on the home route
        const url = event.urlAfterRedirects;
        this.isHome = url === '/' || url === '' || url.split('?')[0] === '/';
        this.isStudentPortal = url.startsWith('/student');
        this.loadExternalScript();
      }
    });
  }

  loadExternalScript() {
    const scriptElement = document.createElement('script');
    scriptElement.src = 'assets/js/main.js';
    scriptElement.onload = () => {
      // console.log('External script loaded');
    };
    document.body.appendChild(scriptElement);
  }

}
