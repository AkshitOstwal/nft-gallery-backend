import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { NFTTokenDto } from './dto';
import { TokenListDto } from './dto/tokenList.dto';

@Injectable()
export class NftListService {
    constructor(private httpService: HttpService, private prisma: PrismaService) { }
    async getList(address: string) {
        return await this.fetchDataWithAuthHeaders();
    }


    async fetchDataWithAuthHeaders() {
        const userAddress = "0x77016474B3FFf23611cB827efBADaEa44f10637c";
        const apiUrl = `https://api.reservoir.tools/users/${userAddress}/tokens/v7?limit=5`;
        const headers = {
            'x-api-key': '9dfc69d3-e18a-5235-be2e-d6dfeac2b8b1',
            'accept': '*/*' // Add other headers as needed
        };

        const response: TokenListDto = await lastValueFrom(this.httpService.get(apiUrl, { headers }).pipe(map((response) => response.data)));


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

            await this.prisma.nFTToken.upsert({
                where: { id: `${token.contract}:${token.tokenId}:${token.chainId}` },
                create: nftToken as any,
                update: nftToken as any,
            });

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
        const userData = await this.prisma.userData.upsert({
            where: { address: userAddress },
            create: {
                address: userAddress,
                joinedAt: new Date().toISOString(),
                updatedAt: tokenList[0].dateOfAcquisition,
                // Other UserData fields
                tokens: {
                    connect: nftTokensToAdd.map((token) => ({
                        id: token.id,
                    })) as any,// Create NFTToken records
                },
            },
            update: {
                // Update UserData fields if the record already exists
                tokens: {
                    connect: nftTokensToAdd.map((token) => ({
                        id: token.id,
                    })) as any,// Create NFTToken records
                },
            },
            include: {
                tokens: true, // Include associated tokens in the result
            },
        });


        return this.toObject(await this.prisma.userData.findUnique({ where: { address: userAddress }, include: { tokens: true } }));
    }

    toObject(val) {
        return JSON.parse(JSON.stringify(val, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
    }

}
