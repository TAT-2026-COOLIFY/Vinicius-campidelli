import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { configuracaoAplicacao } from './app/app.config';

bootstrapApplication(AppComponent, configuracaoAplicacao).catch((erro) => console.error(erro));
