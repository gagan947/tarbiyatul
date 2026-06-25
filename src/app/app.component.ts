import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule]
})
export class AppComponent {
  title = 'tarbiyatul';

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
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
