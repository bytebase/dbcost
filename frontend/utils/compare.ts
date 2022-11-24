const versusStr = "-vs-";

export const slugToName = (slug: string): [string, string] => {
  const [comparerA, comparerB] = slug.split(versusStr);
  return [comparerA, comparerB];
};
