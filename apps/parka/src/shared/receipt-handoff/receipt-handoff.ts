const KEY = 'parka:receipt-handoff';

type Stored = { name: string; type: string; data: string };

const read = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** Keeps a picked photo for the next page; `false` when it does not fit. */
export const stashReceipt = async (file: File): Promise<boolean> => {
  try {
    const data = await read(file);
    const value: Stored = { name: file.name, type: file.type, data };
    sessionStorage.setItem(KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

/** Takes the stashed photo (once), `null` when there is none. */
export const takeReceipt = async (): Promise<File | null> => {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (!raw) return null;
    const { name, type, data } = JSON.parse(raw) as Stored;
    const blob = await (await fetch(data)).blob();
    return new File([blob], name, { type });
  } catch {
    return null;
  }
};
