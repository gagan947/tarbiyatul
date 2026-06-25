import { Component } from '@angular/core';
import { FooterComponent } from '../../shared components/footer/footer.component';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.css'],
    standalone: true,
    imports: [HeaderComponent, FooterComponent]
})
export class HistoryComponent {

}
