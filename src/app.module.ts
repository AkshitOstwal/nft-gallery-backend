import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NftDetailsModule } from './nft_details/nft_details.module';
import { NftListModule } from './nft_list/nft_list.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [NftDetailsModule, NftListModule, HttpModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
