// Behavioral test double. Real PostgreSQL lock/concurrency tests are separate.
export function commerceFixture({ percentOff = 100, maxRedemptions = 1 } = {}) {
  let state = {
    orders: [], requests: [], users: ["alice", "bob"].map((id) => ({
      id, email: `${id}@example.com`, name: id, emailVerified: new Date(), disabled: false,
      phone: null, company: null, addressLine1: null, addressLine2: null,
      city: null, region: null, postalCode: null, country: "PH",
    })),
    cart: ["alice", "bob"].map((userId) => ({
      id: `cart-${userId}`, userId, addonIds: [], createdAt: new Date(),
      designId: "design", design: { id: "design", slug: "test", title: "Test", heroImage: "/test.webp", heroAlt: "Test", status: "PUBLISHED" },
      tier: { id: "tier", designId: "design", level: "STARTER", priceCents: 10000 },
    })),
    coupon: { id: "coupon", code: "LAST", active: true, redemptions: 0, maxRedemptions, percentOff, amountOffCents: null, expiresAt: null, minSubtotalCents: null },
  };
  function matches(row, where = {}) {
    return Object.entries(where).every(([key, value]) => {
      if (value && typeof value === "object" && !(value instanceof Date)) {
        if ("in" in value) return value.in.includes(row[key]);
        if ("lt" in value) return row[key] < value.lt;
      }
      return row[key] === value;
    });
  }
  let failPaymentRef = false;
  const client = {
    $queryRaw: async () => [],
    user: { findUnique: async ({ where }) => state.users.find((row) => matches(row, where)) ?? null },
    account: { findUnique: async () => null },
    cartItem: {
      findMany: async ({ where }) => structuredClone(state.cart.filter((row) => matches(row, where))),
      deleteMany: async ({ where }) => { state.cart = state.cart.filter((row) => !matches(row, where)); },
    },
    addon: { findMany: async () => [] },
    coupon: {
      findUnique: async ({ where }) => matches(state.coupon, where) ? structuredClone(state.coupon) : null,
      findUniqueOrThrow: async () => structuredClone(state.coupon),
      updateMany: async ({ data }) => { state.coupon.redemptions += data.redemptions.increment; return { count: 1 }; },
    },
    checkoutRequest: {
      findUnique: async ({ where }) => {
        const request = state.requests.find((row) => matches(row, where.userId_key));
        return request ? { ...request, order: structuredClone(state.orders.find((o) => o.id === request.orderId)) } : null;
      },
      create: async ({ data }) => { state.requests.push(data); return data; },
    },
    order: {
      findUnique: async ({ where }) => structuredClone(state.orders.find((row) => matches(row, where)) ?? null),
      findUniqueOrThrow: async ({ where }) => {
        const row = state.orders.find((r) => matches(r, where));
        if (!row) throw new Error("Missing order");
        return { ...structuredClone(row), user: state.users.find((u) => u.id === row.userId) };
      },
      count: async ({ where }) => state.orders.filter((row) => matches(row, where)).length,
      findMany: async ({ where }) => structuredClone(state.orders.filter((row) => matches(row, where))),
      create: async ({ data }) => {
        const row = {
          id: `order-${state.orders.length + 1}`, status: "PENDING", paymentRef: null,
          confirmationSentAt: null, receiptUrl: null, createdAt: new Date(), updatedAt: new Date(),
          confirmationAttempts: 0, confirmationNextAt: null, confirmationLeaseUntil: null,
          confirmationLeaseToken: null, confirmationPayload: null,
          ...data, items: data.items.create,
        };
        state.orders.push(row);
        return structuredClone(row);
      },
      update: async ({ where, data }) => {
        if (failPaymentRef && data.paymentRef) { failPaymentRef = false; throw new Error("Database connection lost"); }
        const row = state.orders.find((r) => matches(r, where));
        Object.assign(row, data);
        return structuredClone(row);
      },
      updateMany: async ({ where, data }) => {
        const rows = state.orders.filter((row) => matches(row, where));
        rows.forEach((row) => Object.assign(row, data));
        return { count: rows.length };
      },
    },
  };
  let queue = Promise.resolve();
  client.$transaction = (work) => {
    const result = queue.then(async () => {
      const before = structuredClone(state);
      try { return await work(client); } catch (error) { state = before; throw error; }
    });
    queue = result.catch(() => {});
    return result;
  };
  return {
    client, state: () => state,
    failNextPaymentRef: () => { failPaymentRef = true; },
  };
}

export function stripeFixture() {
  const sessions = new Map();
  const calls = [];
  const gateway = {
    coupons: { create: async () => ({ id: "coupon" }) },
    checkout: { sessions: {
      create: async (parameters, options) => {
        calls.push(structuredClone({ parameters, options }));
        if (!sessions.has(options.idempotencyKey)) {
          sessions.set(options.idempotencyKey, {
            id: `cs_${sessions.size + 1}`, metadata: parameters.metadata,
            amount_total: parameters.line_items.reduce((sum, item) => sum + item.price_data.unit_amount, 0),
            currency: "php", payment_status: "unpaid", status: "open", payment_intent: null,
            url: "https://checkout.stripe.com/test", expires_at: parameters.expires_at,
          });
        }
        return sessions.get(options.idempotencyKey);
      },
      retrieve: async (id) => [...sessions.values()].find((s) => s.id === id),
      list: () => ({ autoPagingEach: async (callback) => {
        for (const session of sessions.values()) if (callback(session) === false) break;
      } }),
    } },
  };
  return { gateway, calls, sessions };
}
