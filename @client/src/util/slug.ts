export var slugit = (str: string) =>
  str
    .replace(/[^\w\s]/gi, '')
    .replace(/\s{1,}/gim, '-')
    .toLowerCase()
