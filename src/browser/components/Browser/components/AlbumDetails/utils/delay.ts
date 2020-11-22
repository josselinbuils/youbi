export async function delay(durationMS: number): Promise<undefined> {
  return new Promise<undefined>((resolve) => setTimeout(resolve, durationMS));
}
