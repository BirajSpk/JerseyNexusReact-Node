// Temporary forms wrapper to replace react-hook-form
// This provides basic form handling without external dependencies

import React, { useState } from 'react';

export const useForm = (defaultValues = {}) => {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});

  const register = (name, options = {}) => ({
    name,
    value: values[name] || '',
    onChange: (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setValues(prev => ({ ...prev, [name]: value }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    },
    onBlur: () => {
      // Basic validation
      if (options.required && !values[name]) {
        setErrors(prev => ({ ...prev, [name]: `${name} is required` }));
      }
    }
  });

  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    Object.keys(values).forEach(key => {
      if (!values[key]) {
        newErrors[key] = `${key} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(values);
  };

  const formState = {
    errors,
    isValid: Object.keys(errors).length === 0
  };

  const reset = () => {
    setValues(defaultValues);
    setErrors({});
  };

  return {
    register,
    handleSubmit,
    formState,
    reset,
    setValue: (name, value) => setValues(prev => ({ ...prev, [name]: value })),
    getValues: () => values,
    watch: (name) => values[name]
  };
};

export default useForm;