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
  SelectInput,
  Create,
  useRecordContext,
  NumberField,
} from "react-admin";

const ChallengeTitle = () => {
  const record = useRecordContext();
  return <span>Challenge {record ? `"${record.question}"` : ""}</span>;
};

const challengeFilters = [
  <TextInput key="q" source="q" label="Search" alwaysOn />,
  <ReferenceInput key="lessonId" source="lessonId" reference="lessons" alwaysOn />,
];

export const ChallengeList = () => (
  <List filters={challengeFilters}>
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <NumberField source="id" />
      <TextField source="question" />
      <TextField source="type" />
      <ReferenceField source="lessonId" reference="lessons" />
      <NumberField source="order" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const ChallengeEdit = () => (
  <Edit title={<ChallengeTitle />}>
    <SimpleForm>
      <NumberInput source="id" disabled />
      <TextInput source="question" validate={required()} />
      <SelectInput
        source="type"
        choices={[
          { id: "SELECT", name: "SELECT" },
          { id: "HINT", name: "HINT" },
        ]}
        validate={required()}
      />
      <ReferenceInput source="lessonId" reference="lessons" />
      <NumberInput source="order" validate={required()} />
    </SimpleForm>
  </Edit>
);

export const ChallengeCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="question" validate={required()} />
      <SelectInput
        source="type"
        choices={[
          { id: "SELECT", name: "SELECT" },
          { id: "HINT", name: "HINT" },
        ]}
        validate={required()}
      />
      <ReferenceInput source="lessonId" reference="lessons" />
      <NumberInput source="order" validate={required()} />
    </SimpleForm>
  </Create>
);

const required = () => (value: any) =>
  value == null || value === "" ? "Required" : undefined;