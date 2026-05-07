import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult,
} from '@Oimmei-Digital-Boutique/crema-components';
import {oiFetch} from '@/@oimmei/services/auth';
import {Tag, TagFilter} from "@/@oimmei/bundle/tag/type/model/Tag";

interface TagApiHelperConfig {
  baseUrl: string;
  entityName?: string;
}

export class TagApiHelper<T extends Tag = Tag, F extends TagFilter = TagFilter> {
  private readonly baseUrl: string;
  private readonly entityName: string;

  constructor(config: string | TagApiHelperConfig) {
    if (typeof config === 'string') {
      this.baseUrl = config;
      this.entityName = this.extractEntityName(config);
    } else {
      this.baseUrl = config.baseUrl;
      this.entityName = config.entityName || this.extractEntityName(config.baseUrl);
    }
  }

  private extractEntityName(url: string): string {
    // Estrae il nome dell'entità dall'URL (es: '/backend/customer-tag' -> 'customer_tag')
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1].replace(/-/g, '_');
  }

  async allTag(): Promise<DetailResult<T[]>> {
    const {data} = await oiFetch.get<DetailResult<T[]>>(`${this.baseUrl}-all`);
    return data;
  }

  async getTags(
    {
      sortBy,
      sortDirection,
      page,
      perPage,
      filters,
    }: PaginatedQuery<T, F>): Promise<PaginatedResult<T>> {
    const {data} = await oiFetch.get<PaginatedResult<T>>(this.baseUrl, {
      params: {
        page: page,
        per_page: perPage,
        [`${this.entityName}_search_form`]: {
          sortBy: sortBy,
          sortMode: sortDirection,
          label: filters?.label,
        },
      },
    });

    return data;
  }

  async findTag({id}: { id: T['id'] }): Promise<DetailResult<T>> {
    const {data} = await oiFetch.get<DetailResult<T>>(`${this.baseUrl}/${id}`);
    return data;
  }

  async createTag({entity}: { entity: T }): Promise<DetailResult<T>> {
    const {data} = await oiFetch.post<DetailResult<T>>(`${this.baseUrl}/new`, {
      'tag_base': {
        label: entity.label,
        color: entity.color,
        icon: entity.icon,
      },
    });

    return data;
  }

  async searchTag({q}: { q: T['label'] }): Promise<DetailResult<T[]>> {
    const {data} = await oiFetch.post<DetailResult<T[]>>(`${this.baseUrl}-search`, {
      q: q,
    });

    return data;
  }

  async autocompleteCreateTag({label}: { label: T['label'] }): Promise<DetailResult<T>> {
    const {data} = await oiFetch.post<DetailResult<T>>(`${this.baseUrl}-create`, {
      label: label,
    });

    return data;
  }

  async findManyTag({q}: { q: T['label'] }): Promise<DetailResult<T[]>> {
    const {data} = await oiFetch.post<DetailResult<T[]>>(`${this.baseUrl}-find-many`, {
      q: q,
    });

    return data;
  }

  async updateTag({entity}: { entity: T }): Promise<DetailResult<T>> {
    const {data} = await oiFetch.post<DetailResult<T>>(
      `${this.baseUrl}/${entity.id}/edit`,
      {
        'tag_base': {
          label: entity.label,
          color: entity.color,
          icon: entity.icon,
        },
      }
    );

    return data;
  }

  async deleteTag({entity}: { entity: T }): Promise<DetailResult<T>> {
    const {data} = await oiFetch.post<DetailResult<T>>(
      `${this.baseUrl}/${entity.id}/delete`
    );

    return data;
  }
}