import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { lastValueFrom, map } from 'rxjs';
import { toObject } from 'src/helper';
import { SaleListDTO, TokenListDto } from 'src/nft_list/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NftDetailsService {
    constructor(private httpService: HttpService, private prisma: PrismaService) { }
    async getTokenData(id: string, fetchLatest: string = 'false') {


        if (fetchLatest && fetchLatest.toLowerCase() === 'true') {
            await this.fetchAndProcessResponse(id);
        }


        const data = await this.prisma.nFTToken.findUnique({
            where: { id: id }
        }
        );

        console.log("returning Token data",);

        return toObject(data);

    }

    async fetchAndProcessResponse(id: string,) {

        // await this._processGetListResponse(response, userAddress);
        let nftToken = await this.prisma.nFTToken.findUnique({ where: { id: `${id}` } });
        const floorPriceData = await this._fetchFloorPriceFromAPI(nftToken.userDataAddress, nftToken.contractAddress, nftToken.tokenId);
        const salesData = await this._fetchCostBasisFromAPI(nftToken.contractAddress, nftToken.tokenId);

        const floorPriceToken = floorPriceData.tokens.find((ele) => { return id.toLowerCase() === `${ele.token.contract}:${ele.token.tokenId}:${ele.token.chainId}`.toLowerCase() })

        const sale = salesData.sales.find((sale) => { return sale.to.toLowerCase() == nftToken.userDataAddress.toLowerCase() });

        nftToken.totalCostBasisUSD = new Decimal(sale?.price?.amount?.usd ?? 0);
        nftToken.totalCostBasisWEI = BigInt(sale?.price?.amount?.raw ?? 0);
        nftToken.totalCurrentValueUSD = new Decimal((sale?.price?.amount?.usd ?? 0) * nftToken.itemCount);
        nftToken.unrealizedGainsLosses = (nftToken.floorPriceUSD.toNumber() - sale?.price?.amount?.usd ?? 0);
        nftToken.totalCurrentValueWEI = BigInt(Number(sale?.price?.amount?.raw ?? 0) * nftToken.itemCount);
        nftToken.floorPriceUSD = new Decimal(floorPriceToken.token.collection?.floorAskPrice?.amount?.usd ?? 0);
        nftToken.floorPriceWEI = BigInt(floorPriceToken.token.collection?.floorAskPrice?.amount?.raw ?? 0);

        await this.prisma.createOrUpdateNFTTokens({ nftToken });


        console.log("completed token data updataion\n",);
    }

    async _fetchFloorPriceFromAPI(userAddress: string, contractAddress: string, tokenId: string) {
        let apiUrl = `https://api.reservoir.tools/users/${userAddress}/tokens/v7?tokens=${contractAddress}:${tokenId}`;

        const headers = {
            'x-api-key': '9dfc69d3-e18a-5235-be2e-d6dfeac2b8b1',
            'accept': '*/*' // Add other headers as needed
        };

        const response: TokenListDto = await lastValueFrom(this.httpService.get(apiUrl, { headers, }).pipe(map((response) => response.data)));
        return response;
    }

    async _fetchCostBasisFromAPI(contractAddress: string, tokenId: string) {
        let apiUrl = `https://api.reservoir.tools/sales/v6?tokens=${contractAddress}:${tokenId}`;

        const headers = {
            'x-api-key': '9dfc69d3-e18a-5235-be2e-d6dfeac2b8b1',
            'accept': '*/*' // Add other headers as needed
        };
        try {
            const response: SaleListDTO = await lastValueFrom(this.httpService.get(apiUrl, { headers }).pipe(map((response) => response.data)));
            console.log("response.sales.length:", response.sales.length);
            return response;
        } catch (error) {
            console.log(error)
            throw error;
        }

    }
}
