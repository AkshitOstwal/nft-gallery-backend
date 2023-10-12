-- CreateTable
CREATE TABLE "UserData" (
    "address" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserData_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "contract" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "imageSmall" TEXT NOT NULL,
    "imageLarge" TEXT NOT NULL,
    "rarityScore" INTEGER,
    "rarityRank" INTEGER,
    "supply" INTEGER,
    "remainingSupply" INTEGER,
    "media" TEXT,
    "isFlagged" BOOLEAN NOT NULL,
    "lastFlagUpdate" TIMESTAMP(3),
    "lastFlagChange" TIMESTAMP(3),
    "collectionId" TEXT NOT NULL,
    "lastAppraisalValue" DOUBLE PRECISION,
    "userDataAddress" TEXT,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "openseaVerificationStatus" TEXT NOT NULL,
    "royaltiesBps" INTEGER NOT NULL,
    "royalties" TEXT[],
    "nFTPriceId" INTEGER NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFTPrice" (
    "id" SERIAL NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,
    "maker" TEXT,
    "kind" TEXT,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "source" TEXT,

    CONSTRAINT "NFTPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" SERIAL NOT NULL,
    "contract" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ownership" (
    "id" SERIAL NOT NULL,
    "tokenCount" TEXT NOT NULL,
    "onSaleCount" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL,
    "nFTPriceId" INTEGER,

    CONSTRAINT "Ownership_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userDataAddress_fkey" FOREIGN KEY ("userDataAddress") REFERENCES "UserData"("address") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_nFTPriceId_fkey" FOREIGN KEY ("nFTPriceId") REFERENCES "NFTPrice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFTPrice" ADD CONSTRAINT "NFTPrice_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ownership" ADD CONSTRAINT "Ownership_nFTPriceId_fkey" FOREIGN KEY ("nFTPriceId") REFERENCES "NFTPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
