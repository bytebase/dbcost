const icon = import.meta.globEager(`@/assets/icon/*.png`);
export const getIconPath = (name: string): string => {
  for (const path in icon) {
    if (path.includes(name)) {
      return icon[path].default;
    }
  }
  return "";
};
