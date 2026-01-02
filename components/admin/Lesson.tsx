"use client";

import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  EditButton,
  DeleteButton,
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  NumberInput,
  Create,
  useRecordContext,
  NumberField,
} from "react-admin";

const LessonTitle = () => {
  const record = useRecordContext();
  return <span>Lesson {record ? `"${record.title}"` : ""}</span>;
};

const lessonFilters = [
  <TextInput key="q" source="q" label="Search" alwaysOn />,
  <ReferenceInput key="unitId" source="unitId" reference="units" alwaysOn />,
];

export const LessonList = () => (
  <List filters={lessonFilters}>
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <NumberField source="id" />
      <TextField source="title" />
      <ReferenceField source="unitId" reference="units" />
      <NumberField source="order" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const LessonEdit = () => (
  <Edit title={<LessonTitle />}>
    <SimpleForm>
      <NumberInput source="id" disabled />
      <TextInput source="title" validate={required()} />
      <ReferenceInput source="unitId" reference="units" />
      <NumberInput source="order" validate={required()} />
    </SimpleForm>
  </Edit>
);

export const LessonCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" validate={required()} />
      <ReferenceInput source="unitId" reference="units" />
      <NumberInput source="order" validate={required()} />
    </SimpleForm>
  </Create>
);

const required = () => (value: any) =>
  value == null || value === "" ? "Required" : undefined;