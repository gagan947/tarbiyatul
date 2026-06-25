import { Component } from '@angular/core';
import { FooterComponent } from '../../shared components/footer/footer.component';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-founder-message',
    templateUrl: './founder-message.component.html',
    styleUrls: ['./founder-message.component.css'],
    standalone: true,
    imports: [HeaderComponent, FooterComponent]
})
export class FounderMessageComponent {

}
