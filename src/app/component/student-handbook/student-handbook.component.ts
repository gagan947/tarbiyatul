import { Component } from '@angular/core';
import { FooterComponent } from '../../shared components/footer/footer.component';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-student-handbook',
    templateUrl: './student-handbook.component.html',
    styleUrls: ['./student-handbook.component.css'],
    standalone: true,
    imports: [HeaderComponent, FooterComponent]
})
export class StudentHandbookComponent {

}
