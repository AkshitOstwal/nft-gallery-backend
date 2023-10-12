-- CreateTable
CREATE TABLE "NFTToken" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "collectionName" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "imageSmall" TEXT NOT NULL,
    "floorPriceUSD" DECIMAL(65,30) NOT NULL,
    "floorPriceWEI" BIGINT NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "totalCostBasisUSD" DECIMAL(65,30) NOT NULL,
    "totalCostBasisWEI" BIGINT NOT NULL,
    "totalCurrentValueUSD" DECIMAL(65,30) NOT NULL,
    "totalCurrentValueWEI" BIGINT NOT NULL,
    "unrealisedGainsLosses" INTEGER NOT NULL,
    "dateOfAcquisation" TIMESTAMP(3) NOT NULL,
    "userDataAddress" TEXT,

    CONSTRAINT "NFTToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NFTToken" ADD CONSTRAINT "NFTToken_userDataAddress_fkey" FOREIGN KEY ("userDataAddress") REFERENCES "UserData"("address") ON DELETE SET NULL ON UPDATE CASCADE;
