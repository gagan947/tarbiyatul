import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-academic-program',
    templateUrl: './academic-program.component.html',
    styleUrls: ['./academic-program.component.css'],
    standalone: true,
    imports: [CommonModule, RouterLink]
})
export class AcademicProgramComponent implements OnInit, AfterViewInit {
    activeTab: string = 'Pre-K';

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['tab'] === 'adult-education' || params['tab'] === 'Adult-Education') {
                this.activeTab = 'Adult-Education';
                this.triggerAdultTabClick();
            }
        });
    }

    ngAfterViewInit(): void {
        if (this.activeTab === 'Adult-Education') {
            this.triggerAdultTabClick();
        }
    }

    triggerAdultTabClick(): void {
        setTimeout(() => {
            const adultTabBtn = document.getElementById('pills-Adult-Education-tab');
            if (adultTabBtn) {
                adultTabBtn.click();
            }
        }, 150);
    }

    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }
}
