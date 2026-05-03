# Stripe 配置指南

> 目标：在 Stripe 创建 $19/月 的订阅产品，拿到 4 个密钥填入 `.env.local`

---

## 第一步：注册 Stripe 账号

1. 打开 https://dashboard.stripe.com/register
2. 用 Google 账号或邮箱注册
3. 注册后进入 Dashboard，**确认左上角开关是 "Test Mode"（测试模式）**

---

## 第二步：获取 API Keys

1. 左侧菜单 → **Developers** → **API keys**
2. 你会看到两个 Key：

   | Key 名称 | 以...开头 | 填到 .env.local 的哪个变量 |
   |----------|-----------|---------------------------|
   | Publishable key | `pk_test_...` | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
   | Secret key | `sk_test_...` | `STRIPE_SECRET_KEY` |

3. Secret key 旁边有一个 **"Reveal test key"** 按钮，点一下才能看完整 key
4. 把两个 Key 分别填到 `.env.local`：

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

---

## 第三步：创建产品 & 价格

1. 左侧菜单 → **Products** → 右上角 **Add product**
2. 填写：
   - **Name**: `RemixSo Pro`
   - **Description**: `Unlimited AI content repurposing for solo creators`
   - **Price model**: 选 **Standard pricing**
   - **Price**: `19.00`
   - **Currency**: `USD`
   - **Recurring**: 选 **Monthly**（每个月扣一次）
3. 点击右上角 **Save product**
4. 创建完成后，页面会显示一个 **Price ID**，格式类似 `price_xxxxxxxxxxxxx`
5. 复制这个 Price ID，填到 `.env.local`：

```
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
```

---

## 第四步：安装 Stripe CLI（本地测试用）

Stripe CLI 能把 Stripe 的 webhook 事件转发到你的本地电脑。

**Windows 安装：**

打开 PowerShell，运行：
```powershell
scoop install stripe
```

如果没有 scoop，直接下载 exe：
1. 打开 https://github.com/stripe/stripe-cli/releases
2. 下载 `stripe_1.x.x_windows_x86_64.zip`
3. 解压，把 `stripe.exe` 放到项目根目录 `J:\Media\ideas\remixso\` 下

**登录 Stripe CLI：**

```bash
stripe login
```

会打开浏览器，点 "Allow" 授权。完成后终端显示 "Done!"。

**启动 Webhook 转发：**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

启动后会显示一个 webhook signing secret（以 `whsec_` 开头）。复制它，填到 `.env.local`：

```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

> **注意**：每次运行 `stripe listen` 都会生成一个新的 signing secret，所以每次都要更新 `.env.local` 里的 `STRIPE_WEBHOOK_SECRET`

保持这个终端窗口一直运行，不要关。

---

## 第五步：配置 Customer Portal

1. 在 Stripe Dashboard，点右上角齿轮图标 → **Settings**
2. 左侧 → **Billing** → **Customer portal**
3. 点击 **Activate portal**
4. 配置以下三项：
   - **Allow customers to cancel subscriptions**: 勾选，选 "At the end of the billing period"
   - **Allow customers to update payment methods**: 勾选
   - **Allow customers to view invoices**: 勾选
5. 点 **Save changes**

---

## 第六步：检查 .env.local 是否完整

最终你的 `.env.local` 应该包含以下 4 行 Stripe 配置：

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
```

---

## 测试流程

1. 确保 `stripe listen` 在运行
2. 确保 `npm run dev` 在运行
3. 浏览器打开 `http://localhost:3000`，点 "Start 7-Day Free Trial"
4. 在 Stripe Checkout 页面用测试卡号：
   - **卡号**：`4242 4242 4242 4242`
   - **有效期**：任意未来日期（比如 `12/30`）
   - **CVC**：任意 3 位数（比如 `123`）
   - **持卡人姓名**：任意
5. 点 "Subscribe"，成功后会自动跳回 `/account`
6. 账号页应该显示 "RemixSo Pro — Trial Active"
7. 去 Dashboard 生成内容，应该显示 "Pro — unlimited"

---

## 生产环境

上线前需要：
1. 在 Stripe Dashboard 把 Test Mode 切换到 **Live Mode**
2. 用 Live 的 API Keys 替换 `.env.local` 中的 `pk_test_` / `sk_test_`
3. 在 Stripe Dashboard → Webhooks → Add endpoint：
   - URL: `https://你的域名/api/webhooks/stripe`
   - Events: 勾选 `checkout.session.completed`、`customer.subscription.updated`、`customer.subscription.deleted`
   - 复制 signing secret 替换 `whsec_test_` 为 `whsec_live_`

这些等开发完再做，现在用测试模式就够了。
