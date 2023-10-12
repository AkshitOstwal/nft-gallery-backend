export interface NFTTokenDto {
    id: String;
    tokenId: string;
    contractAddress: string;
    name: string | null;
    chainId: number;
    collectionName: string | null;
    image: string | null;
    imageSmall: string | null;
    floorPriceUSD: number | null;
    floorPriceWEI: number | null;
    itemCount: number;
    totalCostBasisUSD: number | null;
    totalCostBasisWEI: number | null;
    totalCurrentValueUSD: number | null;
    totalCurrentValueWEI: number | null;
    unrealizedGainsLosses: number | null;
    dateOfAcquisition: Date;
}