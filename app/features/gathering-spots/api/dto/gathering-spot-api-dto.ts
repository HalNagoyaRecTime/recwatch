export type GatheringSpotResponseDto = {
  gathering_spot_id: number;
  gathering_spot_name: string;
  created_at: string;
  updated_at: string;
};

// The API currently accepts camelCase request bodies. Keep this boundary
// explicit until the backend contract is intentionally changed.
export type GatheringSpotWriteRequestDto = {
  gatheringSpotName: string;
};
