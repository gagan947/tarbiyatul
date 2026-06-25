import { Component } from '@angular/core';
import { FooterComponent } from '../../shared components/footer/footer.component';
import { HeaderComponent } from '../../shared components/header/header.component';

@Component({
    selector: 'app-vision',
    templateUrl: './vision.component.html',
    styleUrls: ['./vision.component.css'],
    standalone: true,
    imports: [HeaderComponent, FooterComponent]
})
export class VisionComponent {

}
