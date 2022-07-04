const icon = import.meta.globEager(`@/assets/icon/*.png`);
export const getIconPath = (name: string): string => {
  for (const path in icon) {
    // e.g., '../assets/icon/gcp.png' --> 'gcp.png'
    const fileName = path.split("/")[path.split("/").length - 1];
    if (fileName === name) {
      return icon[path].default;
    }
  }
  return "";
};
