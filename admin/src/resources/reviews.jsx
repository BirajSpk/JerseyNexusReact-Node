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
  Show,
  SimpleForm,
  SimpleShowLayout,
  NumberInput,
  TextInput,
  required,
  BooleanField,
  BooleanInput,
} from 'react-admin';

export const ReviewList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="user.name" label="User" />
      <TextField source="product.name" label="Product" />
      <NumberField source="rating" />
      <TextField source="comment" />
      <BooleanField source="approved" label="Approved" />
      <DateField source="createdAt" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export const ReviewShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="user.name" label="User" />
      <TextField source="user.email" label="User Email" />
      <TextField source="product.name" label="Product" />
      <NumberField source="rating" />
      <TextField source="comment" />
      <BooleanField source="approved" label="Approved" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </SimpleShowLayout>
  </Show>
);

export const ReviewEdit = () => (
  <Edit>
    <SimpleForm>
      <NumberInput source="rating" validate={[required()]} min={1} max={5} />
      <TextInput source="comment" multiline rows={4} />
      <BooleanInput source="approved" label="Approve Review" />
    </SimpleForm>
  </Edit>
);