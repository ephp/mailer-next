'use client';

import React, {ReactElement, useCallback, useEffect} from "react";
import {generatePathStorage} from "@Oimmei-Digital-Boutique/crema-components";
import {useParams, useRouter} from 'next/navigation';
import {MAIL_LIST_CONTACTS} from '@/shared/constants/AppRoutes';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {findContact} from '@/shared/helpers/api/contactApiHelper';
import ContactForm from '@/components/contact/ContactForm';

const ContactEditContent = (): ReactElement | null => {
  const router = useRouter();
  const {id: idParam, contactId: contactIdParam} = useParams<{id: string; contactId: string}>();
  const listId = parseInt(idParam);

  const {
    result: contactWrapper,
    perform: fetchContact,
    loading,
  } = useAsyncLoader(findContact, true);

  const onOperationCompleted = useCallback(() => {
    router.push(generatePathStorage(MAIL_LIST_CONTACTS, {id: idParam}));
  }, [router, idParam]);

  useEffect(() => {
    fetchContact({listId, id: parseInt(contactIdParam)}).catch(console.error);
  }, [fetchContact, listId, contactIdParam]);

  return (
    <ContactForm
      contact={contactWrapper?.item ?? null}
      listId={listId}
      editing={true}
      loading={loading}
      onOperationCompleted={onOperationCompleted}
    />
  );
};

export default ContactEditContent;
