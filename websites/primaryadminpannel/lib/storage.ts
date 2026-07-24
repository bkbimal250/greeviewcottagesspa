type StorageType = "local" | "session";

interface StorageOptions<T> {
  storage?: StorageType;
  fallback?: T;
  expiresInMs?: number;
}

interface StoredValue<T> {
  value: T;
  expiresAt?: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStorage(
  storageType: StorageType = "local",
): Storage | null {
  if (!isBrowser()) {
    return null;
  }

  return storageType === "session"
    ? window.sessionStorage
    : window.localStorage;
}

function createStoredValue<T>(
  value: T,
  expiresInMs?: number,
): StoredValue<T> {
  return {
    value,
    expiresAt:
      expiresInMs && expiresInMs > 0
        ? Date.now() + expiresInMs
        : undefined,
  };
}

function isStoredValueExpired<T>(
  storedValue: StoredValue<T>,
): boolean {
  return Boolean(
    storedValue.expiresAt &&
      storedValue.expiresAt <= Date.now(),
  );
}

export function setStorageItem<T>(
  key: string,
  value: T,
  options: StorageOptions<T> = {},
): boolean {
  const storage = getStorage(
    options.storage || "local",
  );

  if (!storage) {
    return false;
  }

  try {
    const storedValue = createStoredValue(
      value,
      options.expiresInMs,
    );

    storage.setItem(
      key,
      JSON.stringify(storedValue),
    );

    return true;
  } catch (error) {
    console.error(
      `Unable to store "${key}" in browser storage:`,
      error,
    );

    return false;
  }
}

export function getStorageItem<T>(
  key: string,
  options: StorageOptions<T> = {},
): T | undefined {
  const storageType =
    options.storage || "local";

  const storage = getStorage(storageType);

  if (!storage) {
    return options.fallback;
  }

  const rawValue = storage.getItem(key);

  if (rawValue === null) {
    return options.fallback;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as
      | StoredValue<T>
      | T;

    const isWrappedValue =
      parsedValue !== null &&
      typeof parsedValue === "object" &&
      "value" in parsedValue;

    if (!isWrappedValue) {
      return parsedValue as T;
    }

    const storedValue =
      parsedValue as StoredValue<T>;

    if (isStoredValueExpired(storedValue)) {
      storage.removeItem(key);
      return options.fallback;
    }

    return storedValue.value;
  } catch {
    return rawValue as T;
  }
}

export function removeStorageItem(
  key: string,
  storageType: StorageType = "local",
): boolean {
  const storage = getStorage(storageType);

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    console.error(
      `Unable to remove "${key}" from browser storage:`,
      error,
    );

    return false;
  }
}

export function hasStorageItem(
  key: string,
  storageType: StorageType = "local",
): boolean {
  const storage = getStorage(storageType);

  if (!storage) {
    return false;
  }

  return storage.getItem(key) !== null;
}

export function clearStorage(
  storageType: StorageType = "local",
): boolean {
  const storage = getStorage(storageType);

  if (!storage) {
    return false;
  }

  try {
    storage.clear();
    return true;
  } catch (error) {
    console.error(
      "Unable to clear browser storage:",
      error,
    );

    return false;
  }
}

export function removeStorageItems(
  keys: string[],
  storageType: StorageType = "local",
): void {
  keys.forEach((key) => {
    removeStorageItem(key, storageType);
  });
}

export function getStorageKeys(
  storageType: StorageType = "local",
): string[] {
  const storage = getStorage(storageType);

  if (!storage) {
    return [];
  }

  return Array.from(
    { length: storage.length },
    (_, index) => storage.key(index),
  ).filter(
    (key): key is string => key !== null,
  );
}

export function removeStorageByPrefix(
  prefix: string,
  storageType: StorageType = "local",
): void {
  const storage = getStorage(storageType);

  if (!storage) {
    return;
  }

  const matchingKeys = getStorageKeys(
    storageType,
  ).filter((key) => key.startsWith(prefix));

  matchingKeys.forEach((key) => {
    storage.removeItem(key);
  });
}

export function setLocalStorageItem<T>(
  key: string,
  value: T,
  expiresInMs?: number,
): boolean {
  return setStorageItem(key, value, {
    storage: "local",
    expiresInMs,
  });
}

export function getLocalStorageItem<T>(
  key: string,
  fallback?: T,
): T | undefined {
  return getStorageItem<T>(key, {
    storage: "local",
    fallback,
  });
}

export function removeLocalStorageItem(
  key: string,
): boolean {
  return removeStorageItem(key, "local");
}

export function setSessionStorageItem<T>(
  key: string,
  value: T,
  expiresInMs?: number,
): boolean {
  return setStorageItem(key, value, {
    storage: "session",
    expiresInMs,
  });
}

export function getSessionStorageItem<T>(
  key: string,
  fallback?: T,
): T | undefined {
  return getStorageItem<T>(key, {
    storage: "session",
    fallback,
  });
}

export function removeSessionStorageItem(
  key: string,
): boolean {
  return removeStorageItem(key, "session");
}