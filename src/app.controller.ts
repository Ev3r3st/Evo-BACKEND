import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('hello') // Nový endpoint na "/hello"
  getHelloEndpoint(): string {
    return 'Ahoj, tohle je endpoint /hello!';
  }
}
