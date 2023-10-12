import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            }
        })
    }


    public async currentUserData(userAddress) {
        return await this.userData.findUnique({ where: { address: userAddress }, });
    }


    async createOrUpdateNFTTokens({ nftToken }) {
        await this.nFTToken.upsert({
            where: { id: `${nftToken.contractAddress}:${nftToken.tokenId}:${nftToken.chainId}` },
            create: nftToken as any,
            update: nftToken as any,
        });
    }

    async createOrUpdateUserData({ userAddress, nftTokensToAdd }) {
        const userData = await this.userData.upsert({
            where: { address: userAddress },
            create: {
                address: userAddress,
                joinedAt: new Date().toISOString(),
                updatedAt: nftTokensToAdd[0]?.dateOfAcquisition ?? new Date(),
                tokensCount: (await this.userData.findUnique({
                    where: { address: userAddress }, include: {
                        tokens: true
                    }
                }))?.tokensCount ?? 0 + nftTokensToAdd.length,
                // Other UserData fields
                tokens: {
                    connect: nftTokensToAdd.map((token) => ({
                        id: token.id,
                    })) as any,// Create NFTToken records
                },
            },
            update: {
                // Update UserData fields if the record already exists
                tokensCount: (await this.userData.findUnique({ where: { address: userAddress }, include: { tokens: true } }))?.tokensCount ?? 0 + nftTokensToAdd.length,
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
    }
}
