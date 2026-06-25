import { Component } from '@angular/core';
import { FooterComponent } from '../../shared components/footer/footer.component';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-weekend-school',
    templateUrl: './weekend-school.component.html',
    styleUrls: ['./weekend-school.component.css'],
    standalone: true,
    imports: [HeaderComponent, FooterComponent]
})
export class WeekendSchoolComponent {

}
