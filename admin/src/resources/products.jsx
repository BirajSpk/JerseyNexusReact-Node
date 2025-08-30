import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  EditButton,
  ShowButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  ReferenceInput,
  required,
} from 'react-admin';

export const ProductList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <NumberField source="price" />
      <NumberField source="stock" />
      <TextField source="category.name" label="Category" />
      <DateField source="createdAt" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export const ProductEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} />
      <TextInput source="description" multiline rows={4} />
      <NumberInput source="price" validate={[required()]} />
      <NumberInput source="stock" validate={[required()]} />
      <ReferenceInput source="categoryId" reference="categories">
        <SelectInput optionText="name" validate={[required()]} />
      </ReferenceInput>
      <TextInput source="metaTitle" />
      <TextInput source="metaDescription" multiline rows={2} />
    </SimpleForm>
  </Edit>
);

export const ProductCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} />
      <TextInput source="description" multiline rows={4} />
      <NumberInput source="price" validate={[required()]} />
      <NumberInput source="stock" validate={[required()]} />
      <ReferenceInput source="categoryId" reference="categories">
        <SelectInput optionText="name" validate={[required()]} />
      </ReferenceInput>
      <TextInput source="metaTitle" />
      <TextInput source="metaDescription" multiline rows={2} />
    </SimpleForm>
  </Create>
);