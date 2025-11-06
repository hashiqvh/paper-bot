"use client";

import { createContext, ReactNode, useContext, useState } from 'react';

interface ExpenseCategory {
  id: string;
  name: string;
  isDefault: boolean;
}

interface ExpenseCategoriesContextType {
  categories: ExpenseCategory[];
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
}

const ExpenseCategoriesContext = createContext<ExpenseCategoriesContextType | undefined>(undefined);

export function ExpenseCategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([
    { id: '1', name: 'Advertising', isDefault: true },
    { id: '2', name: 'Office', isDefault: true },
    { id: '3', name: 'Platform Fee', isDefault: true },
    { id: '4', name: 'Other', isDefault: true },
    { id: '5', name: 'Travel', isDefault: false },
    { id: '6', name: 'Professional Services', isDefault: false },
  ]);

  const addCategory = (name: string) => {
    const newCategory: ExpenseCategory = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      isDefault: false,
    };
    setCategories([...categories, newCategory]);
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <ExpenseCategoriesContext.Provider value={{ categories, addCategory, removeCategory }}>
      {children}
    </ExpenseCategoriesContext.Provider>
  );
}

export function useExpenseCategories() {
  const context = useContext(ExpenseCategoriesContext);
  if (context === undefined) {
    throw new Error('useExpenseCategories must be used within an ExpenseCategoriesProvider');
  }
  return context;
}
