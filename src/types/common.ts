/**
 * Все свойства сущности, включая под-объекты необязательны
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
