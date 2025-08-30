import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  EditButton,
  ShowButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  required,
  email,
} from 'react-admin';

export const UserList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="role" />
      <DateField source="createdAt" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} />
      <TextInput source="email" validate={[required(), email()]} />
      <SelectInput 
        source="role" 
        choices={[
          { id: 'USER', name: 'User' },
          { id: 'ADMIN', name: 'Admin' },
        ]}
        validate={[required()]}
      />
    </SimpleForm>
  </Edit>
);

export const UserCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} />
      <TextInput source="email" validate={[required(), email()]} />
      <TextInput source="password" type="password" validate={[required()]} />
      <SelectInput 
        source="role" 
        choices={[
          { id: 'USER', name: 'User' },
          { id: 'ADMIN', name: 'Admin' },
        ]}
        validate={[required()]}
        defaultValue="USER"
      />
    </SimpleForm>
  </Create>
);