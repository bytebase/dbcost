export const isEmptyArray = (arr: any[] | undefined) => {
  if (Array.isArray(arr) && !arr.length) {
    return true;
  }

  return false;
};
