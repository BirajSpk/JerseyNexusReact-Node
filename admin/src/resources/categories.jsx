import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  ShowButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  required,
} from 'react-admin';

export const CategoryList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="slug" />
      <TextField source="type" />
      <DateField source="createdAt" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export const CategoryEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} />
      <SelectInput 
        source="type" 
        choices={[
          { id: 'PRODUCT', name: 'Product' },
          { id: 'BLOG', name: 'Blog' },
        ]}
        validate={[required()]}
      />
    </SimpleForm>
  </Edit>
);

export const CategoryCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} />
      <SelectInput 
        source="type" 
        choices={[
          { id: 'PRODUCT', name: 'Product' },
          { id: 'BLOG', name: 'Blog' },
        ]}
        validate={[required()]}
        defaultValue="PRODUCT"
      />
    </SimpleForm>
  </Create>
);