import { useState, type ImgHTMLAttributes } from 'react';

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallback: string;
}

/**
 * <img> с автоматическим переключением на fallback при ошибке загрузки.
 * Используется, когда основной источник — внешняя ссылка (может отвалиться),
 * а fallback — DiceBear-аватар, который всегда доступен.
 */
export function SmartImage({ src, fallback, onError, ...rest }: SmartImageProps) {
  const [current, setCurrent] = useState(src);
  return (
    <img
      {...rest}
      src={current}
      onError={(e) => {
        if (current !== fallback) {
          setCurrent(fallback);
        }
        onError?.(e);
      }}
    />
  );
}
