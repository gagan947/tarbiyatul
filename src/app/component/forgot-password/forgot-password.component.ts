import { Component } from '@angular/core';
import { FooterComponent } from '../../shared components/footer/footer.component';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css'],
    standalone: true,
    imports: [HeaderComponent, RouterLink, FooterComponent]
})
export class ForgotPasswordComponent {

}
