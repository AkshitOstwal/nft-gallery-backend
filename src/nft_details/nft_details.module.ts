import { Module } from '@nestjs/common';
import { NftDetailsController } from './nft_details.controller';
import { NftDetailsService } from './nft_details.service';

@Module({
  controllers: [NftDetailsController],
  providers: [NftDetailsService],
})
export class NftDetailsModule { }
