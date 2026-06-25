import { Component } from '@angular/core';
import { FooterComponent } from '../../shared components/footer/footer.component';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-academic-program',
    templateUrl: './academic-program.component.html',
    styleUrls: ['./academic-program.component.css'],
    standalone: true,
    imports: [HeaderComponent, FooterComponent]
})
export class AcademicProgramComponent {

}
