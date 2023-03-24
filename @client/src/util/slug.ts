export var slugit = (str: string) =>
  str
    .replace(/[^\w\s]/gim, '')
    .replace(/\s{1,}/gim, '-')
    .toLowerCase()
