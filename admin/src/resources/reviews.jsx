import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  EditButton,
  ShowButton,
  Edit,
  SimpleForm,
  NumberInput,
  TextInput,
  required,
} from 'react-admin';

export const ReviewList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="user.name" label="User" />
      <TextField source="product.name" label="Product" />
      <NumberField source="rating" />
      <TextField source="comment" />
      <DateField source="createdAt" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export const ReviewEdit = () => (
  <Edit>
    <SimpleForm>
      <NumberInput source="rating" validate={[required()]} min={1} max={5} />
      <TextInput source="comment" multiline rows={4} />
    </SimpleForm>
  </Edit>
);