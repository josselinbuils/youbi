export function groupBy(
  array: Array<any>,
  key: string
): { [key: string]: any } {
  return array.reduce((map, item) => {
    if (map[item[key]] === undefined) {
      map[item[key]] = [];
    }
    map[item[key]].push(item);
    return map;
  }, {});
}
