"use client";

import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  Edit,
  SimpleForm,
  TextInput,
  Create,
  useRecordContext,
  NumberField,
} from "react-admin";

const CourseTitle = () => {
  const record = useRecordContext();
  return <span>Course {record ? `"${record.title}"` : ""}</span>;
};

const courseFilters = [
  <TextInput key="q" source="q" label="Search" alwaysOn />,
];

export const CourseList = () => (
  <List filters={courseFilters}>
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <NumberField source="id" />
      <TextField source="title" />
      <TextField source="altCode" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const CourseEdit = () => (
  <Edit title={<CourseTitle />}>
    <SimpleForm>
      <TextInput source="id" disabled />
      <TextInput source="title" validate={required()} />
      <TextInput source="altCode" validate={required()} />
    </SimpleForm>
  </Edit>
);

export const CourseCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" validate={required()} />
      <TextInput source="altCode" validate={required()} />
    </SimpleForm>
  </Create>
);

const required = () => (value: any) =>
  value == null || value === "" ? "Required" : undefined;