import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StudentClassRoomMembershipPanel } from "~/features/students/components/StudentClassRoomMembershipPanel";
import type { StudentRow } from "~/features/students/model/student";

const api = {
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
  updateStudentClassRoom: vi.fn(),
};

const member: StudentRow = {
  attendanceNumber: 3,
  classRoom: { classRoomId: 12, classCode: "1A", className: "1年A組" },
  displayName: "山田 花子",
  isLiveActive: true,
  isStaff: false,
  studentId: 7,
  studentIdNumber: "S007",
  userId: 11,
};

describe("StudentClassRoomMembershipPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("所属生徒の出席番号・氏名・学籍番号と件数を表示する", () => {
    render(
      <StudentClassRoomMembershipPanel
        api={api}
        classRoom={member.classRoom!}
        classRoomId={12}
        memberPage={{ items: [member], limit: 10, offset: 0, total: 1 }}
        onMemberPageChange={vi.fn()}
        onRevalidate={vi.fn()}
        onSearchChange={vi.fn()}
        search=""
        searchPage={null}
      />
    );

    expect(screen.getByText("所属メンバー 1人")).toBeInTheDocument();
    expect(screen.getByText("3番")).toBeInTheDocument();
    expect(screen.getByText("山田 花子")).toBeInTheDocument();
    expect(screen.getByText("S007")).toBeInTheDocument();
  });

  it("検索結果で未所属・別クラス所属・所属済みを区別する", () => {
    const unassigned = {
      ...member,
      attendanceNumber: null,
      classRoom: null,
      displayName: "未所属 太郎",
      studentId: 8,
    };
    const otherClass = {
      ...member,
      attendanceNumber: 5,
      classRoom: { classRoomId: 13, classCode: "1B", className: "1年B組" },
      displayName: "佐藤 次郎",
      studentId: 9,
    };
    render(
      <StudentClassRoomMembershipPanel
        api={api}
        classRoom={member.classRoom!}
        classRoomId={12}
        memberPage={{ items: [], limit: 10, offset: 0, total: 0 }}
        onMemberPageChange={vi.fn()}
        onRevalidate={vi.fn()}
        onSearchChange={vi.fn()}
        search="生徒"
        searchPage={{
          items: [unassigned, otherClass, member],
          limit: 10,
          offset: 0,
          total: 3,
        }}
      />
    );

    expect(screen.getByText(/S007 · 所属済み/)).toBeInTheDocument();
    expect(screen.getByText(/S007 · 未所属/)).toBeInTheDocument();
    expect(screen.getByText(/現在: 1B \/ 5番/)).toBeInTheDocument();
    for (const button of [
      screen.getByRole("button", { name: "このクラスに追加" }),
      screen.getByRole("button", { name: "このクラスへ移動" }),
      screen.getByRole("button", { name: "所属済み" }),
    ]) {
      expect(button).toBeDisabled();
    }
  });

  it("検索入力と所属一覧のページ変更をRouteへ通知する", async () => {
    const onMemberPageChange = vi.fn();
    const onSearchChange = vi.fn();
    render(
      <StudentClassRoomMembershipPanel
        api={api}
        classRoom={member.classRoom!}
        classRoomId={12}
        memberPage={{ items: [member], limit: 1, offset: 0, total: 2 }}
        onMemberPageChange={onMemberPageChange}
        onRevalidate={vi.fn()}
        onSearchChange={onSearchChange}
        search=""
        searchPage={null}
      />
    );

    const user = userEvent.setup();
    await user.type(
      screen.getByRole("searchbox", { name: "追加する生徒を検索" }),
      "山"
    );
    expect(onSearchChange).toHaveBeenCalledWith("山");
    await user.click(screen.getByRole("button", { name: "次のページ" }));
    expect(onMemberPageChange).toHaveBeenCalledWith(2);
  });

  it("出席番号を指定して未所属Studentをこのクラスへ追加する", async () => {
    const onRevalidate = vi.fn();
    api.updateStudentClassRoom.mockResolvedValue(member);
    render(
      <StudentClassRoomMembershipPanel
        api={api}
        classRoom={member.classRoom!}
        classRoomId={12}
        memberPage={{ items: [], limit: 10, offset: 0, total: 0 }}
        onMemberPageChange={vi.fn()}
        onRevalidate={onRevalidate}
        onSearchChange={vi.fn()}
        search="未所属"
        searchPage={{
          items: [{ ...member, attendanceNumber: null, classRoom: null }],
          limit: 10,
          offset: 0,
          total: 1,
        }}
      />
    );

    const user = userEvent.setup();
    await user.type(
      screen.getByRole("spinbutton", {
        name: "山田 花子の新しい出席番号",
      }),
      "5"
    );
    await user.click(screen.getByRole("button", { name: "このクラスに追加" }));

    expect(api.updateStudentClassRoom).toHaveBeenCalledWith(7, {
      attendanceNumber: 5,
      classRoomId: 12,
    });
    expect(onRevalidate).toHaveBeenCalledOnce();
  });

  it("所属Studentを確認後に未所属化する", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    api.updateStudentClassRoom.mockResolvedValue({
      ...member,
      attendanceNumber: null,
      classRoom: null,
    });
    render(
      <StudentClassRoomMembershipPanel
        api={api}
        classRoom={member.classRoom!}
        classRoomId={12}
        memberPage={{ items: [member], limit: 10, offset: 0, total: 1 }}
        onMemberPageChange={vi.fn()}
        onRevalidate={vi.fn()}
        onSearchChange={vi.fn()}
        search=""
        searchPage={null}
      />
    );

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "クラスから外す" }));

    expect(api.updateStudentClassRoom).toHaveBeenCalledWith(7, {
      attendanceNumber: null,
      classRoomId: null,
    });
  });

  it("対象クラスを固定して新しいStudentを登録する", async () => {
    api.createStudent.mockResolvedValue(member);
    render(
      <StudentClassRoomMembershipPanel
        api={api}
        classRoom={member.classRoom!}
        classRoomId={12}
        memberPage={{ items: [], limit: 10, offset: 0, total: 0 }}
        onMemberPageChange={vi.fn()}
        onRevalidate={vi.fn()}
        onSearchChange={vi.fn()}
        search=""
        searchPage={null}
      />
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "新しい生徒を登録" }));
    await user.type(screen.getByLabelText("氏名*"), "新規 太郎");
    await user.type(screen.getByLabelText("学籍番号*"), "S100");
    await user.type(screen.getByLabelText("出席番号*"), "10");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(api.createStudent).toHaveBeenCalledWith({
      attendanceNumber: 10,
      classRoomId: 12,
      displayName: "新規 太郎",
      studentIdNumber: "S100",
    });
  });
});
