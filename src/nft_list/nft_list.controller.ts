import { Controller, Get, Query } from '@nestjs/common';
import { NftListService } from './nft_list.service';

@Controller('nft-list')
export class NftListController {
    constructor(private NftListService: NftListService) {
    }

    @Get('getList')
    getList(@Query("address") address: string) {
        return this.NftListService.getList(address);
    }


}
