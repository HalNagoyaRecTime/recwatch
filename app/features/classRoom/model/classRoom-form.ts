import type { ClassRoomWriteInput } from "~/features/classRoom/model/classRoom";

export const emptyClassRoomForm: ClassRoomWriteInput = {
  classCode: "",
  className: "",
  teacherId: null,
};
