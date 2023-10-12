import { Controller, Get, Query } from '@nestjs/common';
import { NftDetailsService } from './nft_details.service';

@Controller('nft-details')
export class NftDetailsController {
    constructor(private NftDetailsService: NftDetailsService) {
    }

    @Get('token')
    getList(
        @Query("id") id: string,
        @Query("fetchLatest") fetchLatest?: string

    ) {
        return this.NftDetailsService.getTokenData(id, fetchLatest);
    }
}

