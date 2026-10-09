/** Eventなど他Featureが参照する実施場所の最小公開モデル。 */
export type VenueOption = {
  id: number;
  name: string;
};

/** 実施場所の管理APIを隠した読み取り専用境界。 */
export interface VenueReader {
  listAll(): Promise<VenueOption[]>;
}
