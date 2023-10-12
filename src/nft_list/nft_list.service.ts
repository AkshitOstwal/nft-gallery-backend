import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { lastValueFrom, map } from 'rxjs';
import { toObject } from 'src/helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { NFTTokenDto } from './dto';
import { SaleListDTO, TokenListDto } from './dto/tokenList.dto';


@Injectable()
export class NftListService {
    PAGE_SIZE = 20;
    constructor(private httpService: HttpService, private prisma: PrismaService) { }

    async getList(userAddress: string, page: number = 1, fetchLatest: string = 'false') {
        let tokensCount = ((await this.prisma.currentUserData(userAddress))?.tokensCount ?? 0);
        if (page > tokensCount / this.PAGE_SIZE) {
            page = Math.ceil((tokensCount / this.PAGE_SIZE))
        }
        if (page <= 0) {
            page = 1;
        }

        if (fetchLatest && fetchLatest.toLowerCase() === 'true') {
            await this.fetchAndProcessResponse(userAddress);
        }


        const data = await this.prisma.userData.findUnique({
            where: { address: userAddress }, include: {
                tokens: {
                    orderBy: {
                        dateOfAcquisition: 'desc'
                    },
                    take: this.PAGE_SIZE,
                    skip: (page - 1) * this.PAGE_SIZE,
                }
            }
        });

        console.log("returning data\n length", data.tokens.length);
        console.log("returning data tokensCount", data.tokensCount);

        return toObject(data);

    }

    async fetchAndProcessResponse(userAddress: string, continuation?) {
        const response = await this._fetchDataFromAPI(userAddress, continuation);

        await this._processGetListResponse(response, userAddress);


        console.log("completed 1st call\n",);
        await this._fetchSalesData(response, userAddress);
        if (response.continuation ?? false) {
            console.log("GOing in continuations\n",);

            //TODO remove await here 
            await this.fetchAndProcessResponse(userAddress, response.continuation);
        }
    }

    async _processGetListResponse(response: TokenListDto, userAddress: string) {

        let tokenList: NFTTokenDto[] = [];
        response.tokens.forEach(async (data) => {
            const token = data.token;
            const ownership = data.ownership;
            const collection = token.collection;

            // const tokenActivity: SaleListDTO = await this._fetchCostBasisFromAPI(token.contract, token.tokenId)
            // const thisUserSales = tokenActivity?.sales?.find((dto) => dto.to.toLowerCase() === userAddress.toLowerCase())

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
                rarityRank: token.rarityRank,
                totalCostBasisUSD: 0,
                totalCostBasisWEI: 0,
                totalCurrentValueUSD: 0 * Number(ownership.tokenCount),
                unrealizedGainsLosses: (collection.floorAskPrice?.amount?.usd ?? 0) - 0,
                totalCurrentValueWEI: (0 * Number(ownership.tokenCount)),
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
        let apiUrl = `${process.env.BASE_API_URL}/users/${userAddress}/tokens/v7`;

        let params: { [key: string]: any } = {
            //TODO change back to 20 if going for async
            "limit": 200,
            'sortby': 'acquiredAt',
        }
        if (continuation) {
            params.limit = 200;
            params.continuation = continuation;
        }

        const headers = {
            'x-api-key': process.env.API_KEY,
            'accept': '*/*' // Add other headers as needed
        };

        const response: TokenListDto = await lastValueFrom(this.httpService.get(apiUrl, { headers, params }).pipe(map((response) => response.data)));
        console.log("resiviour response length = ", response.tokens.length);
        console.log("response continuations=", response.continuation);
        return response;

    }

    async _fetchSalesData(response: TokenListDto, userAddress) {

        let tokenAndIds = [];

        response.tokens.forEach((dto) => {
            tokenAndIds.push({ token: dto.token.contract, tokenId: dto.token.tokenId })
        })

        const maxElementsPerSublist = 20;

        const sublists = [];
        for (let i = 0; i < tokenAndIds.length; i += maxElementsPerSublist) {
            const sublist = tokenAndIds.slice(i, i + maxElementsPerSublist);
            sublists.push(sublist);
        }
        console.log({ sublists });

        await sublists.forEach(async (item) => {
            const res = await this._fetchCostBasisFromAPI(item);


            res.sales.forEach(async (sale) => {
                // TODO missing case of rebuying nft
                if (sale.to.toLowerCase() == userAddress.toLowerCase()) {

                    let thisToken = response.tokens.find(
                        (ele) => { return (ele.token.contract == sale.token.contract && ele.token.tokenId == sale.token.tokenId); });
                    let nftToken = await this.prisma.nFTToken.findUnique({ where: { id: `${thisToken.token.contract}:${thisToken.token.tokenId}:${thisToken.token.chainId}` } });

                    nftToken.totalCostBasisUSD = new Decimal(sale?.price?.amount?.usd ?? 0);
                    nftToken.totalCostBasisWEI = BigInt(sale?.price?.amount?.raw ?? 0);
                    nftToken.totalCurrentValueUSD = new Decimal((sale?.price?.amount?.usd ?? 0) * nftToken.itemCount);
                    nftToken.unrealizedGainsLosses = (nftToken.floorPriceUSD.toNumber() - sale?.price?.amount?.usd ?? 0);
                    nftToken.totalCurrentValueWEI = BigInt(Number(sale?.price?.amount?.raw ?? 0) * nftToken.itemCount);

                    await this.prisma.createOrUpdateNFTTokens({ nftToken });
                }
            })

        })

    }

    async _fetchCostBasisFromAPI(tokensParams) {
        const tokensParam = tokensParams.map(({ token, tokenId }) => `${token}:${tokenId}`).join('&tokens=');

        let apiUrl = `${process.env.BASE_API_URL}/sales/v6?tokens=${tokensParam}`;

        const headers = {
            'x-api-key': process.env.API_KEY,
            'accept': '*/*' // Add other headers as needed
        };
        try {
            // await new Promise((resolve) => {
            //     setTimeout(resolve, 300);
            // });
            const response: SaleListDTO = await lastValueFrom(this.httpService.get(apiUrl, { headers }).pipe(map((response) => response.data)));
            console.log("response.sales.length:", response.sales.length);
            return response;
        } catch (error) {
            console.log(error)
            throw error;
        }

    }


    // since can't nestJS cant stringify BigInt used in balanceInWei


}
