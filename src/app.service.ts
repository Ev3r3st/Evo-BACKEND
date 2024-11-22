import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Ahoj z AppService!';
  }

  getAppInfo(): { name: string; version: string } {
    return {
      name: 'My Awesome App',
      version: '1.0.0', // Můžete načíst dynamicky z env nebo package.json
    };
  }
}
