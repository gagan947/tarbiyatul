import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: true,
    imports: [CommonModule, RouterLink]
})
export class HomeComponent implements AfterViewInit {
    ngAfterViewInit(): void {
        setTimeout(() => {
            if (typeof (window as any).AOS !== 'undefined') {
                (window as any).AOS.refreshHard();
            }
            window.dispatchEvent(new Event('scroll'));
        }, 100);
    }
}
