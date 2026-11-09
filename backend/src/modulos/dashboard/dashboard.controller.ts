import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  obterVisaoGeral() {
    return this.dashboardService.obterVisaoGeral();
  }

  @Get('indicadores')
  obterIndicadores() {
    return this.dashboardService.obterIndicadores();
  }
}
