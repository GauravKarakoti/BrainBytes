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

const UnitTitle = () => {
  const record = useRecordContext();
  return <span>Unit {record ? `"${record.title}"` : ""}</span>;
};

const unitFilters = [
  <TextInput key="q" source="q" label="Search" alwaysOn />,
  <ReferenceInput key="courseId" source="courseId" reference="courses" alwaysOn />,
];

export const UnitList = () => (
  <List filters={unitFilters}>
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <NumberField source="id" />
      <TextField source="title" />
      <ReferenceField source="courseId" reference="courses" />
      <NumberField source="order" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const UnitEdit = () => (
  <Edit title={<UnitTitle />}>
    <SimpleForm>
      <NumberInput source="id" disabled />
      <TextInput source="title" validate={required()} />
      <TextInput source="description" validate={required()} />
      <ReferenceInput source="courseId" reference="courses" />
      <NumberInput source="order" validate={required()} />
    </SimpleForm>
  </Edit>
);

export const UnitCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" validate={required()} />
      <TextInput source="description" validate={required()} />
      <ReferenceInput source="courseId" reference="courses" />
      <NumberInput source="order" validate={required()} />
    </SimpleForm>
  </Create>
);

const required = () => (value: any) =>
  value == null || value === "" ? "Required" : undefined;