import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { TeacherClassAssignmentPage } from "~/features/teachers/pages/TeacherClassAssignmentPage";

const updateTeacher = vi.hoisted(() => vi.fn());

vi.mock("~/features/teachers/api", () => ({
  TeacherApi: { updateTeacher },
}));

describe("useTeacherClassAssignment", () => {
  it("クラス割り当てをTeacher更新APIへ送信する", async () => {
    updateTeacher.mockResolvedValueOnce({});
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/teachers/7"]}>
        <TeacherClassAssignmentPage
          classRooms={[
            { classRoomId: 2, className: "2年A組" },
            { classRoomId: 4, className: "4年A組" },
          ]}
          selectedTeacherId={7}
          teachers={[
            {
              teacherId: 7,
              userId: 11,
              displayName: "佐橋 晴斗",
              email: "sahashi@example.com",
              isLiveActive: true,
              isStaff: false,
              classRooms: [
                { classRoomId: 2, classCode: "2A", className: "2年A組" },
              ],
            },
          ]}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("checkbox", { name: "4年A組" }));
    await user.click(
      screen.getByRole("button", { name: "割り当てを登録する" })
    );

    await waitFor(() =>
      expect(updateTeacher).toHaveBeenCalledWith(7, {
        classRoomIds: [2, 4],
        email: "sahashi@example.com",
        userName: "佐橋 晴斗",
      })
    );
  });
});
