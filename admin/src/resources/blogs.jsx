import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  EditButton,
  ShowButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  ReferenceInput,
  SelectInput,
  required,
} from 'react-admin';

export const BlogList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="author.name" label="Author" />
      <TextField source="category.name" label="Category" />
      <BooleanField source="published" />
      <DateField source="createdAt" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export const BlogEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" validate={[required()]} />
      <TextInput source="content" multiline rows={10} validate={[required()]} />
      <ReferenceInput source="categoryId" reference="categories" filter={{ type: 'BLOG' }}>
        <SelectInput optionText="name" validate={[required()]} />
      </ReferenceInput>
      <BooleanInput source="published" />
      <TextInput source="metaTitle" />
      <TextInput source="metaDescription" multiline rows={2} />
    </SimpleForm>
  </Edit>
);

export const BlogCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" validate={[required()]} />
      <TextInput source="content" multiline rows={10} validate={[required()]} />
      <ReferenceInput source="categoryId" reference="categories" filter={{ type: 'BLOG' }}>
        <SelectInput optionText="name" validate={[required()]} />
      </ReferenceInput>
      <BooleanInput source="published" defaultValue={false} />
      <TextInput source="metaTitle" />
      <TextInput source="metaDescription" multiline rows={2} />
    </SimpleForm>
  </Create>
);