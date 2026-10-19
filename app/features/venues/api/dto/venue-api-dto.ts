export type VenueResponseDto = {
  venue_id: number;
  venue_name: string;
  created_at: string;
  updated_at: string;
};

export type VenuePageResponseDto = {
  venues: VenueResponseDto[];
  total: number;
  limit: number;
  offset: number;
};

// API のリクエスト本文は camelCase で受け付けている
export type VenueWriteRequestDto = {
  venueName: string;
};
