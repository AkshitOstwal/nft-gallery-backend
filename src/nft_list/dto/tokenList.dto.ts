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
