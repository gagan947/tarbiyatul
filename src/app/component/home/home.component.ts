import { Component } from '@angular/core';
import { HomePageFooterComponent } from '../../shared components/home-page-footer/home-page-footer.component';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: true,
    imports: [HeaderComponent, HomePageFooterComponent]
})
export class HomeComponent {

}
