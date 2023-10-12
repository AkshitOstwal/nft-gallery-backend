import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NftDetailsController } from './nft_details.controller';
import { NftDetailsService } from './nft_details.service';

@Module({
  imports: [HttpModule],
  controllers: [NftDetailsController],
  providers: [NftDetailsService],
})
export class NftDetailsModule { }
