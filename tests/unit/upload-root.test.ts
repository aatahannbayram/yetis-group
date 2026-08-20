import { describe, expect, it } from "vitest";
import { isSafeUploadSegment, mimeFromFilename } from "@/infra/storage/upload-root";

describe("upload path safety", () => {
  it("accepts product id and uuid filenames", () => {
    expect(isSafeUploadSegment("cmt19v20r0000cl3l5y15s52z")).toBe(true);
    expect(isSafeUploadSegment("16a4550e-826a-41f0-8f76-26b0e6317058.png")).toBe(true);
  });

  it("rejects traversal and separators", () => {
    expect(isSafeUploadSegment("..")).toBe(false);
    expect(isSafeUploadSegment("foo/bar")).toBe(false);
    expect(isSafeUploadSegment("foo\\bar")).toBe(false);
    expect(isSafeUploadSegment("")).toBe(false);
  });

  it("maps common image extensions", () => {
    expect(mimeFromFilename("a.jpg")).toBe("image/jpeg");
    expect(mimeFromFilename("a.PNG")).toBe("image/png");
    expect(mimeFromFilename("a.webp")).toBe("image/webp");
  });
});
