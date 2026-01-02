"use client";

import { Admin, Resource } from "react-admin";
import { dataProvider } from "@/lib/admin/dataProvider";
import {
  CourseList,
  CourseEdit,
  CourseCreate,
} from "@/components/admin/Course";
import { UnitList, UnitEdit, UnitCreate } from "@/components/admin/Unit";
import { LessonList, LessonEdit, LessonCreate } from "@/components/admin/Lesson";
import {
  ChallengeList,
  ChallengeEdit,
  ChallengeCreate,
} from "@/components/admin/Challenge";
import {
  ChallengeOptionList,
  ChallengeOptionEdit,
  ChallengeOptionCreate,
} from "@/components/admin/ChallengeOption";

const AdminApp = () => (
  <Admin dataProvider={dataProvider}>
    <Resource
      name="courses"
      list={CourseList}
      edit={CourseEdit}
      create={CourseCreate}
      recordRepresentation="title"
    />
    <Resource
      name="units"
      list={UnitList}
      edit={UnitEdit}
      create={UnitCreate}
      recordRepresentation="title"
    />
    <Resource
      name="lessons"
      list={LessonList}
      edit={LessonEdit}
      create={LessonCreate}
      recordRepresentation="title"
    />
    <Resource
      name="challenges"
      list={ChallengeList}
      edit={ChallengeEdit}
      create={ChallengeCreate}
      recordRepresentation="question"
    />
    <Resource
      name="challengeOptions"
      list={ChallengeOptionList}
      edit={ChallengeOptionEdit}
      create={ChallengeOptionCreate}
      recordRepresentation="option"
    />
  </Admin>
);

export default AdminApp;