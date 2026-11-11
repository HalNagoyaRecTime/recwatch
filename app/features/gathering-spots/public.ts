/** Eventsなど他Featureが参照する集合場所の最小公開モデル。 */
export type GatheringSpotOption = {
  id: number;
  name: string;
};

/** 集合場所の管理APIを隠した読み取り専用境界。 */
export interface GatheringSpotReader {
  listAll(): Promise<GatheringSpotOption[]>;
}
