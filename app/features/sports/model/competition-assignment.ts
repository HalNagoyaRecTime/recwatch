export type AssignmentClassroom = {
  id: number;
  name: string;
};

export type AssignmentStudent = {
  attendanceNumber: number;
  classroomId: number;
  id: number;
  name: string;
  studentNumber: string;
  userId: number;
};

export type AssignmentEvent = {
  id: number;
  name: string;
  startTime: string;
  venue: string;
};

export type AssignmentGatheringSpot = {
  id: number;
  name: string;
};

export type AssignmentGathering = {
  eventId: number;
  id: number;
  spotId: number;
  time: string;
};

export type CompetitionAssignmentData = {
  classrooms: AssignmentClassroom[];
  students: AssignmentStudent[];
  events: AssignmentEvent[];
  spots: AssignmentGatheringSpot[];
  gatherings: AssignmentGathering[];
};

export type SaveCompetitionAssignmentInput = {
  eventId: number;
  gatheringId: number | null;
  spotId: number;
  time: string;
  userIds: number[];
};

export type SaveCompetitionAssignmentResult = {
  gathering: AssignmentGathering;
};
