import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Создает стабильную ссылку на вызов переданной функции. Не требует указания зависимостей для обновления ссылки.
 *
 * Аналог useEvent https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
 */
export function useRefCallback<TCallback extends (...args: never[]) => unknown>(
  handler: TCallback,
) {
  const handlerRef = useRef<TCallback>(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const stableCallback = useCallback(
    (...args: Parameters<TCallback>) => handlerRef.current(...args),
    [],
  );
  // The wrapper preserves the callback's parameters and return value by construction.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return stableCallback as TCallback;
}
