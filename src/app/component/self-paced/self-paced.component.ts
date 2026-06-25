import { Component } from '@angular/core';
import { FooterComponent } from '../../shared components/footer/footer.component';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-self-paced',
    templateUrl: './self-paced.component.html',
    styleUrls: ['./self-paced.component.css'],
    standalone: true,
    imports: [HeaderComponent, FooterComponent]
})
export class SelfPacedComponent {

}
