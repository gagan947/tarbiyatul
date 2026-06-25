import { Component } from '@angular/core';
import { FooterComponent } from '../../shared components/footer/footer.component';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-admission-process',
    templateUrl: './admission-process.component.html',
    styleUrls: ['./admission-process.component.css'],
    standalone: true,
    imports: [HeaderComponent, FooterComponent]
})
export class AdmissionProcessComponent {

}
