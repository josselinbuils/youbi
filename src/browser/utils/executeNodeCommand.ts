export async function executeNodeCommand(
  executor: string,
  name: string,
  args?: any[]
): Promise<any> {
  return (window as any).ipc.send(executor, { name, args });
}
