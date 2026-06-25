import { Component } from '@angular/core';
import { FooterComponent } from '../../shared components/footer/footer.component';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-summer-school',
    templateUrl: './summer-school.component.html',
    styleUrls: ['./summer-school.component.css'],
    standalone: true,
    imports: [HeaderComponent, FooterComponent]
})
export class SummerSchoolComponent {

}
