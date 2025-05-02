import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getAppInfo(): { name: string; version: string } {
    return {
      name: 'EVO APP',
      version: '1.0.0', //s
    };
  }
}
