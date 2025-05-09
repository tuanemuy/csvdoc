import type { FileType } from "./core/types.ts";
import { parse } from "./parser/index.ts";
import { render } from "./renderer/index.ts";

export * from "./core/types.ts";
export { parse } from "./parser/index.ts";
export { render } from "./renderer/index.ts";

export function transform(input: string, fileType: FileType = "csv"): string {
  const doc = parse(input, fileType);
  return render(doc);
}
