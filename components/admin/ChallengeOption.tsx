"use client";

import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  BooleanField,
  EditButton,
  DeleteButton,
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  BooleanInput,
  Create,
  useRecordContext,
  NumberField,
  NumberInput
} from "react-admin";

const ChallengeOptionTitle = () => {
  const record = useRecordContext();
  return <span>Option {record ? `"${record.option}"` : ""}</span>;
};

const optionFilters = [
  <TextInput key="q" source="q" label="Search" alwaysOn />,
  <ReferenceInput key="challengeId" source="challengeId" reference="challenges" alwaysOn />,
];

export const ChallengeOptionList = () => (
  <List filters={optionFilters}>
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <NumberField source="id" />
      <TextField source="option" />
      <BooleanField source="correct" />
      <ReferenceField source="challengeId" reference="challenges" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const ChallengeOptionEdit = () => (
  <Edit title={<ChallengeOptionTitle />}>
    <SimpleForm>
      <NumberInput source="id" disabled />
      <TextInput source="option" validate={required()} />
      <BooleanInput source="correct" />
      <ReferenceInput source="challengeId" reference="challenges" />
      <TextInput source="imageSrc" />
      <TextInput source="audioSrc" />
    </SimpleForm>
  </Edit>
);

export const ChallengeOptionCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="option" validate={required()} />
      <BooleanInput source="correct" />
      <ReferenceInput source="challengeId" reference="challenges" />
      <TextInput source="imageSrc" />
      <TextInput source="audioSrc" />
    </SimpleForm>
  </Create>
);

const required = () => (value: any) =>
  value == null || value === "" ? "Required" : undefined;