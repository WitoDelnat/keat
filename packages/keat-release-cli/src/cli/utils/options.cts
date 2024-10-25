export function normaliseVariadicOption(option: string | string[] | undefined) {
  if (option === undefined) {
    return undefined;
  }
  const result = [];

  if (Array.isArray(option)) {
    result.push(...option);
  }
  if (typeof option === "string") {
    result.push(option);
  }

  return result;
}
