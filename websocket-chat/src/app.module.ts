import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { AppService } from './app/app.service';

@Module({
  imports: [],
  providers: [AppGateway, AppService],
})
export class AppModule {}
