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
  SelectInput,
  required,
} from 'react-admin';

export const OrderList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="user.name" label="Customer" />
      <NumberField source="totalAmount" />
      <TextField source="status" />
      <DateField source="createdAt" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export const OrderEdit = () => (
  <Edit>
    <SimpleForm>
      <SelectInput 
        source="status" 
        choices={[
          { id: 'PENDING', name: 'Pending' },
          { id: 'PROCESSING', name: 'Processing' },
          { id: 'SHIPPED', name: 'Shipped' },
          { id: 'DELIVERED', name: 'Delivered' },
          { id: 'CANCELLED', name: 'Cancelled' },
        ]}
        validate={[required()]}
      />
    </SimpleForm>
  </Edit>
);