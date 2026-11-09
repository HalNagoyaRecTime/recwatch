import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { StudentMutationApi } from "~/features/students/api/contracts/student-api";
import type { StudentRow } from "~/features/students/model/student";
import { StudentEditPage } from "~/features/students/pages/StudentEditPage";
import { ApiClientError } from "~/lib/api-client-error";
import {
  UPDATE_CONFLICT_MESSAGE,
  UPDATE_CONFLICT_RELOAD_FAILED_MESSAGE,
} from "~/lib/update-conflict";

const student: StudentRow = {
  studentId: 7,
  userId: 107,
  displayName: "山田太郎",
  studentIdNumber: "S007",
  attendanceNumber: null,
  isLiveActive: true,
  isStaff: false,
  classRoom: null,
  lockVersion: 3,
};

const userApi = {
  grantStaff: vi.fn(),
  revokeStaff: vi.fn(),
  updateUserStatus: vi.fn(),
};

function createApi(updateStudent: StudentMutationApi["updateStudent"]) {
  return {
    createStudent: vi.fn(),
    updateStudent,
    updateStudentClassRoom: vi.fn(),
  };
}

describe("StudentEditPage", () => {
  it("保存時に取得した版を送り返す", async () => {
    const updateStudent = vi.fn().mockResolvedValue(student);
    const onSaved = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <StudentEditPage
        api={createApi(updateStudent)}
        classRooms={[]}
        loadLatest={vi.fn()}
        onClose={vi.fn()}
        onSaved={onSaved}
        student={student}
        userApi={userApi}
      />
    );

    await user.click(await screen.findByRole("button", { name: "保存する" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(updateStudent).toHaveBeenCalledWith(7, {
      attendanceNumber: null,
      classRoomId: null,
      displayName: "山田太郎",
      studentIdNumber: "S007",
      lockVersion: 3,
    });
  });

  it("更新が競合したら理由を伝えて再取得し、最新の値でフォームを置き換える", async () => {
    const updateStudent = vi
      .fn()
      .mockRejectedValue(
        new ApiClientError(409, "conflict", "STUDENT_UPDATE_CONFLICT")
      );
    const loadLatest = vi.fn().mockResolvedValue({
      ...student,
      displayName: "他の人の変更",
      lockVersion: 4,
    });
    const user = userEvent.setup();
    render(
      <StudentEditPage
        api={createApi(updateStudent)}
        classRooms={[]}
        loadLatest={loadLatest}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        student={student}
        userApi={userApi}
      />
    );

    const nameInput = await screen.findByLabelText("氏名*");
    await user.clear(nameInput);
    await user.type(nameInput, "自分の変更");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(
      await screen.findByText(UPDATE_CONFLICT_MESSAGE)
    ).toBeInTheDocument();
    expect(loadLatest).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.getByLabelText("氏名*")).toHaveValue("他の人の変更")
    );
    expect(screen.getByText(UPDATE_CONFLICT_MESSAGE)).toBeInTheDocument();
  });

  it("競合後の再取得に失敗したら入力を残し、再度の保存で最新の値へ置き換える", async () => {
    const updateStudent = vi
      .fn()
      .mockRejectedValue(
        new ApiClientError(409, "conflict", "STUDENT_UPDATE_CONFLICT")
      );
    const loadLatest = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue({
        ...student,
        displayName: "他の人の変更",
        lockVersion: 4,
      });
    const user = userEvent.setup();
    render(
      <StudentEditPage
        api={createApi(updateStudent)}
        classRooms={[]}
        loadLatest={loadLatest}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        student={student}
        userApi={userApi}
      />
    );

    const nameInput = await screen.findByLabelText("氏名*");
    await user.clear(nameInput);
    await user.type(nameInput, "自分の変更");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(
      await screen.findByText(UPDATE_CONFLICT_RELOAD_FAILED_MESSAGE)
    ).toBeInTheDocument();
    expect(screen.getByLabelText("氏名*")).toHaveValue("自分の変更");

    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(
      await screen.findByText(UPDATE_CONFLICT_MESSAGE)
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText("氏名*")).toHaveValue("他の人の変更")
    );
    expect(updateStudent).toHaveBeenLastCalledWith(
      7,
      expect.objectContaining({ lockVersion: 3 })
    );
  });

  it("学籍番号の重複など版の競合ではない409では入力を残す", async () => {
    const updateStudent = vi
      .fn()
      .mockRejectedValue(
        new ApiClientError(
          409,
          "この学籍番号は既に使われています。",
          "STUDENT_NUMBER_ALREADY_EXISTS"
        )
      );
    const loadLatest = vi.fn();
    const user = userEvent.setup();

    render(
      <StudentEditPage
        api={createApi(updateStudent)}
        classRooms={[]}
        loadLatest={loadLatest}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        student={student}
        userApi={userApi}
      />
    );

    const nameInput = await screen.findByLabelText("氏名*");
    await user.clear(nameInput);
    await user.type(nameInput, "自分の変更");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(
      await screen.findByText("この学籍番号は既に使われています。")
    ).toBeInTheDocument();
    expect(loadLatest).not.toHaveBeenCalled();
    expect(screen.getByLabelText("氏名*")).toHaveValue("自分の変更");
  });
});
