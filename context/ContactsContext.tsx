import React, { createContext, useContext, useState } from 'react';

export type Contact = {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen?: string;
  profileImage?: string;
};

type ContactsContextType = {
  contacts: Contact[];
  addContact: (contact: Contact) => void;
  removeContact: (id: string) => void;
  toggleOnlineStatus: (id: string) => void;
};

const defaultContacts: Contact[] = [
  { id: '1', name: 'Alice Johnson', isOnline: true, lastSeen: 'Now' },
  { id: '2', name: 'Bob Smith', isOnline: false, lastSeen: '2 hours ago' },
  { id: '3', name: 'Charlie Brown', isOnline: true, lastSeen: 'Now' },
  { id: '4', name: 'Diana Prince', isOnline: false, lastSeen: 'Yesterday' },
  { id: '5', name: 'Evan White', isOnline: true, lastSeen: 'Now' },
  { id: '6', name: 'Fiona Black', isOnline: false, lastSeen: '3 days ago' },
  { id: '7', name: 'George Miller', isOnline: false, lastSeen: '1 week ago' },
  { id: '8', name: 'Hannah Lee', isOnline: false, lastSeen: '5 minutes ago' },
];

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
};

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(defaultContacts);

  const addContact = (contact: Contact) => {
    setContacts([...contacts, contact]);
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  const toggleOnlineStatus = (id: string) => {
    setContacts(
      contacts.map(contact =>
        contact.id === id
          ? { ...contact, isOnline: !contact.isOnline, lastSeen: contact.isOnline ? 'Just now' : 'Now' }
          : contact
      )
    );
  };

  const value = {
    contacts,
    addContact,
    removeContact,
    toggleOnlineStatus,
  };

  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>;
}