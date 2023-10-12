import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { NFTTokenDto } from './dto';
import { TokenListDto } from './dto/tokenList.dto';

@Injectable()
export class NftListService {
    constructor(private httpService: HttpService, private prisma: PrismaService) { }

    async getList(userAddress: string, fetchLatest: boolean = false) {
        if (fetchLatest) {
            await this.fetchAndProcessResponse(userAddress);
        }

        const data = await this.prisma.userData.findUnique({ where: { address: userAddress }, include: { tokens: true } });
        console.log("returning data\n length", data.tokens.length);

        return this.toObject(data);

    }

    async fetchAndProcessResponse(userAddress: string, continuation?) {
        const response = await this._fetchDataFromAPI(userAddress, continuation);

        await this._processGetListResponse(response, userAddress);
        console.log("completed 1st call\n",);

        if (response.continuation ?? false) {
            console.log("GOing in continuations\n",);

            this.fetchAndProcessResponse(userAddress, response.continuation);
        }
    }

    async _processGetListResponse(response: TokenListDto, userAddress: string) {

        let tokenList: NFTTokenDto[] = [];
        response.tokens.forEach(async (data) => {
            const token = data.token;
            const ownership = data.ownership;
            const collection = token.collection;
            const nftToken: NFTTokenDto = {
                id: `${token.contract}:${token.tokenId}:${token.chainId}`,
                chainId: token.chainId,
                collectionName: collection.name,
                contractAddress: token.contract,
                dateOfAcquisition: ownership.acquiredAt ?? new Date(),
                floorPriceUSD: collection.floorAskPrice?.amount?.usd ?? 0,
                floorPriceWEI: Number(collection?.floorAskPrice?.amount?.raw ?? 0),
                image: token.image,
                imageSmall: token.imageSmall,
                itemCount: Number(ownership.tokenCount),
                name: token.name,
                tokenId: token.tokenId,
                totalCostBasisUSD: 0,
                totalCostBasisWEI: 0,
                totalCurrentValueUSD: 0,
                unrealizedGainsLosses: 0,
                totalCurrentValueWEI: 0,
            }

            tokenList.push(nftToken);

            //create or update NFT Token data
            await this.prisma.createOrUpdateNFTTokens({ nftToken });

        })

        //create a filter list of token that are newly created and are not connected to userData
        const nftTokensToAdd = await this.prisma.nFTToken.findMany({
            where: {
                userDataAddress: null,
                id: {
                    in: tokenList.map((dto) => dto.id.toString())
                }
            },
        });


        // const filteredNFTTokenList = tokenList.filter(async (dto) => {
        //     const userData$ = await this.prisma.userData.findUnique({ where: { address: userAddress }, include: { tokens: true } });
        //     return userData$.tokens.some((tokenData) => {
        //         return tokenData.id != dto.id
        //     })
        // }); //  create a filter list of token that are newly created and are not connected to userData

        // Create the UserData record if it doesn't exist
        await this.prisma.createOrUpdateUserData({ userAddress: userAddress, nftTokensToAdd: nftTokensToAdd });
    }


    async _fetchDataFromAPI(userAddress: string, continuation?: string) {
        let apiUrl = `https://api.reservoir.tools/users/${userAddress}/tokens/v7`;

        let params: { [key: string]: any } = {
            "limit": 10,
            'sortby': 'acquiredAt',
        }
        if (continuation) {
            params.limit = 200;
            params.continuation = continuation;
        }
        const headers = {
            'x-api-key': '9dfc69d3-e18a-5235-be2e-d6dfeac2b8b1',
            'accept': '*/*' // Add other headers as needed
        };

        const response: TokenListDto = await lastValueFrom(this.httpService.get(apiUrl, { headers, params }).pipe(map((response) => response.data)));
        console.log("response length = ", response.tokens.length);
        console.log("response continuations=", response.continuation);
        return response;

    }

    // since can't nestJS cant stringify BigInt used in balanceInWei
    toObject(val) {
        return JSON.parse(JSON.stringify(val, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
    }

}
