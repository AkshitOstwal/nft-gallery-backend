import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NftListController } from './nft_list.controller';
import { NftListService } from './nft_list.service';

@Module({
  imports: [HttpModule],
  controllers: [NftListController],
  providers: [NftListService],
})
export class NftListModule { }
