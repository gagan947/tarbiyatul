import { Component } from '@angular/core';
import { FooterComponent } from '../../shared components/footer/footer.component';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'],
    standalone: true,
    imports: [HeaderComponent, RouterLink, FooterComponent]
})
export class SignupComponent {

}
