import { Component } from '@angular/core';
import { FooterComponent } from '../../shared components/footer/footer.component';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-contact-us',
    templateUrl: './contact-us.component.html',
    styleUrls: ['./contact-us.component.css'],
    standalone: true,
    imports: [HeaderComponent, FooterComponent]
})
export class ContactUsComponent {

}
