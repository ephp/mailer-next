'use client';

import React, {ReactElement} from "react";
import {generatePathStorage} from "@Oimmei-Digital-Boutique/crema-components";
import {useParams, useRouter} from 'next/navigation';
import {newContact} from '@/types/models/Contact';
import {MAIL_LIST_CONTACTS} from '@/shared/constants/AppRoutes';
import ContactForm from '@/components/contact/ContactForm';

const ContactNewContent = (): ReactElement | null => {
  const router = useRouter();
  const {id: idParam} = useParams<{id: string}>();
  const listId = parseInt(idParam);

  const onOperationCompleted = (): void => {
    router.push(generatePathStorage(MAIL_LIST_CONTACTS, {id: idParam}));
  };

  return (
    <ContactForm
      contact={newContact}
      listId={listId}
      editing={false}
      onOperationCompleted={onOperationCompleted}
    />
  );
};

export default ContactNewContent;
