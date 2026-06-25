import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css'],
    standalone: true,
    imports: [RouterLink]
})
export class ForgotPasswordComponent {
    constructor(private router: Router) {}

    onSubmit(event: Event): void {
        event.preventDefault();
        // Redirect back to login page
        this.router.navigate(['/login']);
    }
}
