import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
declare var $: any;  // Declare jQuery for use
declare var AOS: any; // Declare AOS for animations
@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.css'],
    standalone: true,
    imports: [RouterLink]
})
export class CalendarComponent {
  private routerSub!: Subscription;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.initializeCarouselAndAOS();

    // Reinitialize on route navigation
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initializeCarouselAndAOS(); // Reinitialize when route changes
      }
    });
  }

  initializeCarouselAndAOS(): void {
    // Initialize Owl Carousel
    $('.ct_calender_slider').owlCarousel({
      loop: true,
      margin: 20,
      nav: true,
      responsive: {
        0: {
          items: 1
        },
        600: {
          items: 2
        },
        1000: {
          items: 4
        }
      }
    });

    // Initialize AOS animations
    AOS.init({
      duration: 1000,  // Animation duration in ms
      once: true       // Whether animation should happen only once
    });
  }

  // Unsubscribe from router events to prevent memory leaks
  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }
}
