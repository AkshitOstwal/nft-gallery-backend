export interface NFTTokenDto {
    id: String;
    tokenId: string;
    contractAddress: string;
    name: string;
    chainId: number;
    collectionName: string;
    image: string;
    imageSmall: string;
    floorPriceUSD: number;
    floorPriceWEI: number;
    itemCount: number;
    totalCostBasisUSD: number;
    totalCostBasisWEI: number;
    totalCurrentValueUSD: number;
    totalCurrentValueWEI: number;
    unrealizedGainsLosses: number;
    dateOfAcquisition: Date;
}