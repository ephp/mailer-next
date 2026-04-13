import {oiFetch} from '@/@oimmei/services/auth';
import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult,
} from '@Oimmei-Digital-Boutique/crema-components';
import {User} from '@/types/models/User';
import {UserListFilter} from '@/types/models/UserCrud/UserListQuery';

export const getUserList = async (
  {
    sortBy,
    sortDirection,
    page,
    perPage,
    filters,
  }: PaginatedQuery<User, UserListFilter>,
): Promise<PaginatedResult<User>> => {
  const {data} = await oiFetch.get<PaginatedResult<User>>('/admin/user', {
    params: {
      page: page,
      per_page: perPage,
      user_search: {
        sortBy: sortBy,
        sortMode: sortDirection,
        ...filters,
      },
    },
  });
  return data;
};

export const disableUser = async (
  {id}: {
    id: User['id']
  },
): Promise<DetailResult<User>> => {
  const {data} = await oiFetch.post<DetailResult<User>>(`/admin/user/${id}/disable`);
  return data;
};

export const enableUser = async (
  {id}: {
    id: User['id']
  },
): Promise<DetailResult<User>> => {
  const {data} = await oiFetch.post<DetailResult<User>>(`/admin/user/${id}/enable`);
  return data;
};

export const resendFirstLoginEmail = async (
  {id}: {
    id: User['id']
  },
): Promise<void> => {
  await oiFetch.post(`/admin/user/${id}/resend-first-login-email`);
};

export const findUser = async (
  {id}: {
    id: User['id']
  },
): Promise<DetailResult<User>> => {
  const {data} = await oiFetch.get<DetailResult<User>>(`/admin/user/${id}`);
  return data;
};

export const createUser = async (
  {entity}: {
    entity: User
  },
): Promise<DetailResult<User>> => {
  const {data} = await oiFetch.post<DetailResult<User>>('/admin/user-new', {
    user: {
      email: entity.email,
    },
  });
  return data;
};

export const updateUser = async (
  {entity}: {
    entity: User
  },
): Promise<DetailResult<User>> => {
  const {data} = await oiFetch.post<DetailResult<User>>(`/admin/user/${entity.id}/edit`, {
    user: {
      email: entity.email,
    },
  });
  return data;
};
