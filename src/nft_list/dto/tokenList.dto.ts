export class TokensDto {
  token: TokenDto;
  ownership: OwnershipDto;
}

export class TokenDto {
  chainId: number;
  contract: string;
  tokenId: string;
  kind: string;
  name: string;
  image: string;
  imageSmall: string;
  imageLarge: string;
  rarityScore: number | null;
  rarityRank: number | null;
  supply: number | null;
  remainingSupply: number | null;
  media: string | null;
  isFlagged: boolean;
  lastFlagUpdate: Date | null;
  lastFlagChange: Date | null;
  collection: CollectionDto;
  lastAppraisalValue: number | null;
}

export class CollectionDto {
  id: string;
  name: string;
  imageUrl: string;
  openseaVerificationStatus: string;
  floorAskPrice: NFTPriceDto;
  royaltiesBps: number;
  royalties: string[];
}

export class NFTPriceDto {
  currency: CurrencyDto;
  amount: {
    raw: string;
    decimal: number;
    usd: number;
    native: number;
  };
}

export class CurrencyDto {
  contract: string;
  name: string;
  symbol: string;
  decimals: number;
}

export class OwnershipDto {
  tokenCount: string;
  onSaleCount: string;
  floorAsk: FloorAskDto;
  acquiredAt: Date;
}

export class FloorAskDto {
  id: string | null;
  price: number | null;
  maker: string | null;
  kind: string | null;
  validFrom: Date | null;
  validUntil: Date | null;
  source: string | null;
}

export interface TokenListDto {
  tokens: TokensDto[];
  continuation: string;
}
export class SaleDTO {
  id: string;
  saleId: string;
  token: {
    contract: string;
    tokenId: string;
    name: string | null;
    image: string | null;
    collection: {
      id: string | null;
      name: string | null;
    };
  };
  orderId: string;
  orderSource: string;
  orderSide: string;
  orderKind: string;
  from: string;
  to: string;
  amount: string;
  fillSource: string;
  block: number;
  txHash: string;
  logIndex: number;
  batchIndex: number;
  timestamp: number;
  price: {
    currency: {
      contract: string;
      name: string;
      symbol: string;
      decimals: number;
    };
    amount: {
      raw: string;
      decimal: number;
      usd: number;
      native: number;
    };
    netAmount: {
      raw: string;
      decimal: number;
      usd: number;
      native: number;
    };
  };
  washTradingScore: number;
  marketplaceFeeBps: number;
  paidFullRoyalty: boolean;
  feeBreakdown: [
    {
      kind: string;
      bps: number;
      recipient: string;
      rawAmount: string;
      source: string;
    }
  ];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export class SaleListDTO {
  sales: SaleDTO[];
  continuation: string | null;
}
