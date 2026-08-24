import type { ParticipantAssignment } from "../model/participant-assignment";

export type ParticipantAssignmentSource = {
  classrooms: Array<{ class_room_id: number; class_name: string }>;
  gatheringSpots: Array<{
    gathering_spot_id: number;
    gathering_spot_name: string;
  }>;
  students: Array<{
    user_id: number;
    display_name: string;
    class_room_id: number;
  }>;
  events: Array<{
    event_id: number;
    event_name: string;
    start_time: string;
    end_time: string;
  }>;
  gatherings: Array<{
    gathering_id: number;
    event_id: number;
    gathering_spot_id: number;
    gathering_time: string;
  }>;
  membersByGatheringId: Map<number, Array<{ user_id: number }>>;
};

export function toParticipantAssignments(
  source: ParticipantAssignmentSource
): ParticipantAssignment[] {
  const classrooms = new Map(
    source.classrooms.map((classroom) => [
      classroom.class_room_id,
      classroom.class_name,
    ])
  );
  const students = new Map(
    source.students.map((student) => [student.user_id, student])
  );
  const events = new Map(source.events.map((event) => [event.event_id, event]));
  const gatheringSpots = new Map(
    source.gatheringSpots.map((spot) => [
      spot.gathering_spot_id,
      spot.gathering_spot_name,
    ])
  );

  return source.gatherings.map((gathering) => {
    const event = events.get(gathering.event_id);
    const members = (
      source.membersByGatheringId.get(gathering.gathering_id) ?? []
    )
      .map((member) => students.get(member.user_id))
      .filter((student): student is NonNullable<typeof student> =>
        Boolean(student)
      );
    const classNames = Array.from(
      new Set(
        members
          .map((student) => classrooms.get(student.class_room_id))
          .filter((name): name is string => Boolean(name))
      )
    );

    return {
      gatheringId: gathering.gathering_id,
      gatheringSpotId: gathering.gathering_spot_id,
      gatheringSpotName:
        gatheringSpots.get(gathering.gathering_spot_id) ?? "集合場所未設定",
      gatheringTime: formatTime(gathering.gathering_time),
      eventId: gathering.event_id,
      eventName: event?.event_name ?? "イベント未設定",
      eventTime: event
        ? `${formatTime(event.start_time)}〜${formatTime(event.end_time)}`
        : "時間未設定",
      classNames,
      memberNames: members.map((student) => student.display_name),
    };
  });
}

function formatTime(value: string) {
  return /^\d{4}$/.test(value)
    ? `${value.slice(0, 2)}:${value.slice(2)}`
    : value;
}
