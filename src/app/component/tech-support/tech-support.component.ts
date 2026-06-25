import { Component } from '@angular/core';
import { FooterComponent } from '../../shared components/footer/footer.component';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-tech-support',
    templateUrl: './tech-support.component.html',
    styleUrls: ['./tech-support.component.css'],
    standalone: true,
    imports: [HeaderComponent, FooterComponent]
})
export class TechSupportComponent {

}
