export function UniqueUserName(inputString: string): string {
  const randomSuffix = Math.random().toString(36).substring(7); // Generate a random string
  const sanitizedInput = inputString.replace(/\W/g, ''); // Remove non-word characters
  const uniqueUsername = `${sanitizedInput}_${randomSuffix}`; // Combine input with random string

  return uniqueUsername;
}

export function UniqueRandomNumber() {
  return Math.floor(100000 + Math.random() * 999999);
}
