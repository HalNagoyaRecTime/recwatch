export type GatheringImportError = {
  rowNumber: number;
  code: string;
  message: string;
  student: string;
};

export type GatheringImportWarning = {
  rowNumber: number;
  student: string;
  registeredName: string;
};

export type GatheringImportMember = {
  rowNumber: number;
  userId: number;
  name: string;
};

export type GatheringImportGathering = {
  time: string;
  spotName: string;
  members: GatheringImportMember[];
};

export type GatheringImportRound = {
  round: number;
  startTime: string | null;
  gatherings: GatheringImportGathering[];
};

export type GatheringImportResult = {
  lockVersion: number;
  totalRows: number;
  importedRows: number;
  excludedRows: number;
  rounds: GatheringImportRound[];
  errors: GatheringImportError[];
  warnings: GatheringImportWarning[];
};
