import { describe, it, expect } from "vitest";

/**
 * API 路由集成测试
 *
 * 测试输入验证逻辑，不依赖 DeepSeek / Supabase 外部服务。
 * 需 dev server 运行在 localhost:3000。
 */

const BASE = "http://localhost:3000";

let ipCounter = 1;

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 每个请求伪造不同 IP 以绕过限流
      "x-forwarded-for": `10.0.0.${ipCounter++}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, body: data };
}

describe("/api/generate 输入验证", () => {
  it("空内容返回 400", async () => {
    const { status, body } = await post("/api/generate", {
      sourceType: "text",
      sourceContent: "",
      platforms: ["twitter"],
      sessionId: "test-empty",
    });
    expect(status).toBe(400);
    expect(body.code).toBe("INVALID_INPUT");
  });

  it("缺少 content 字段返回 400", async () => {
    const { status, body } = await post("/api/generate", {
      sourceType: "text",
      platforms: ["twitter"],
      sessionId: "test-missing",
    });
    expect(status).toBe(400);
    expect(body.code).toBe("INVALID_INPUT");
  });

  it("缺少 platforms 字段返回 400", async () => {
    const { status, body } = await post("/api/generate", {
      sourceType: "text",
      sourceContent: "hello",
      sessionId: "test-noplat",
    });
    expect(status).toBe(400);
    expect(body.code).toBe("INVALID_INPUT");
  });

  it("空 platforms 数组返回 400", async () => {
    const { status, body } = await post("/api/generate", {
      sourceType: "text",
      sourceContent: "hello",
      platforms: [],
      sessionId: "test-emptyplat",
    });
    expect(status).toBe(400);
    expect(body.code).toBe("INVALID_INPUT");
  });

  it("非法 platform 返回 400", async () => {
    const { status, body } = await post("/api/generate", {
      sourceType: "text",
      sourceContent: "hello world",
      platforms: ["onlyfans"],
      sessionId: "test-badplat",
    });
    expect(status).toBe(400);
    expect(body.error).toMatch(/Invalid platform/);
  });

  it("超过 15000 字符直接返回 400（不调用 DB）", async () => {
    const { status, body } = await post("/api/generate", {
      sourceType: "text",
      sourceContent: "A".repeat(16000),
      platforms: ["twitter"],
      sessionId: "test-over-max",
    });
    expect(status).toBe(400);
    expect(body.error).toMatch(/15,000/);
  });

  it("匿名用户超过 5000 字符返回 400", async () => {
    const { status, body } = await post("/api/generate", {
      sourceType: "text",
      sourceContent: "A".repeat(6000),
      platforms: ["twitter"],
      sessionId: "test-over-free",
    });
    expect(status).toBe(400);
    expect(body.error).toMatch(/5,000/);
  });
});

describe("/api/fetch-url 输入验证", () => {
  it("空 URL 返回 400", async () => {
    const { status, body } = await post("/api/fetch-url", { url: "" });
    expect(status).toBe(400);
    expect(body.code).toBe("INVALID_INPUT");
  });

  it("非法 URL 格式返回 500", async () => {
    const { status, body } = await post("/api/fetch-url", {
      url: "not-a-valid-url",
    });
    expect(status).toBe(500);
  });

  it("file:// 协议被拒绝", async () => {
    const { status, body } = await post("/api/fetch-url", {
      url: "file:///etc/passwd",
    });
    expect(status).toBe(500);
    expect(body.error).toMatch(/HTTP/);
  });

  it("内网 IP 被拦截", async () => {
    const { status, body } = await post("/api/fetch-url", {
      url: "http://127.0.0.1:3000",
    });
    expect(body.error).toMatch(/internal network/);
  });

  it("正常 HTTPS 可抓取", async () => {
    const { status, body } = await post("/api/fetch-url", {
      url: "https://example.com",
    });
    expect(status).toBe(200);
    expect(body.title).toBeDefined();
    expect(body.content).toBeDefined();
  });
});

describe("/api/refine 输入验证", () => {
  it("缺少 originalContent 返回 400", async () => {
    const { status, body } = await post("/api/refine", {
      instruction: "make it shorter",
    });
    expect(status).toBe(400);
    expect(body.code).toBe("INVALID_INPUT");
  });

  it("空指令返回 400", async () => {
    const { status, body } = await post("/api/refine", {
      instruction: "",
      originalContent: "some content",
    });
    expect(status).toBe(400);
    expect(body.code).toBe("INVALID_INPUT");
  });
});
