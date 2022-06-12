export interface MediaForum {
  url: string;
  description: string;
}

/**
 * Свойства форума из ЯП
 */
export interface MediaForumProperties {
  /**
   * Ссылка
   */
  href: string;
  /**
   * Название
   */
  name: string;
  /**
   * Когда создан
   */
  created: string;
  /**
   * Сколько страниц
   */
  countPages: number;
}

export interface HasPrevNextPage {
  next: boolean;
  prev: boolean;
  current: number;
}
