import { prisma } from '@/lib/db/prisma';
import { CreateSubscriptionFromTemplateInput } from '@/validations/quotation/quotation.schema';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  customerId?: string | null;
}

function generateSubscriptionNo(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SUB-${ts}-${rand}`;
}

export async function createSubscriptionFromTemplate(
  input: CreateSubscriptionFromTemplateInput,
  user: AuthUser
) {
  const { customerId, templateId, startDate, paymentTermsDays } = input;
  const start = new Date(startDate);

  // 1. Verify customer exists and is active
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
  if (!(customer as any).isActive && !(customer as any).active) {
    throw Object.assign(new Error('Customer is not active'), { statusCode: 400 });
  }

  // 2. Verify template exists and is active
  const template = await prisma.quoteTemplate.findUnique({
    where: { id: templateId },
    include: {
      lines: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });
  if (!template) throw Object.assign(new Error('Quote template not found'), { statusCode: 404 });
  if (!(template as any).isActive && !(template as any).active) {
    throw Object.assign(new Error('Quote template is not active'), { statusCode: 400 });
  }

  // 3. Verify plan exists and is active
  const plan = await prisma.plan.findUnique({
    where: { id: (template as any).planId },
    include: { taxRule: true },
  });
  if (!plan) throw Object.assign(new Error('Plan not found'), { statusCode: 404 });
  if (!(plan as any).isActive) throw Object.assign(new Error('Plan is not active'), { statusCode: 400 });

  // 4. Verify plan availability for start date
  if ((plan as any).availableFrom && start < new Date((plan as any).availableFrom)) {
    throw Object.assign(new Error('Plan is not yet available for the selected start date'), { statusCode: 400 });
  }
  if ((plan as any).availableUntil && start > new Date((plan as any).availableUntil)) {
    throw Object.assign(new Error('Plan is no longer available for the selected start date'), { statusCode: 400 });
  }

  const lines = (template as any).lines ?? [];

  // 5. Verify variants and calculate line prices
  let totalQuantity = 0;
  let recurringTotalPaise = 0;
  const lineData: any[] = [];

  for (const tl of lines) {
    const product = tl.product;
    if (!product) throw Object.assign(new Error(`Product not found for template line`), { statusCode: 400 });

    // If variant specified, verify it belongs to this product
    if (tl.variantId && tl.variant) {
      if (tl.variant.productId !== product.id) {
        throw Object.assign(new Error(`Variant does not belong to product ${product.name}`), { statusCode: 400 });
      }
    }

    const basePrice = tl.unitPricePaise ?? (product as any).salesPricePaise ?? (product as any).salesPrice ?? 0;
    const variantAdj = tl.variant ? ((tl.variant as any).priceAdjustmentPaise ?? 0) : 0;
    const unitPricePaise = basePrice + variantAdj;
    const qty = tl.quantity ?? 1;

    totalQuantity += qty;
    recurringTotalPaise += unitPricePaise * qty;

    lineData.push({
      productId: product.id,
      variantId: tl.variantId ?? null,
      descriptionSnapshot: (product as any).name ?? '',
      skuSnapshot: (product as any).sku ?? '',
      variantSnapshot: tl.variant ? ((tl.variant as any).optionName ?? '') + ':' + ((tl.variant as any).value ?? '') : null,
      quantity: qty,
      unitPricePaise,
      taxNameSnapshot: (plan as any).taxRule?.name ?? null,
      taxRateBps: (plan as any).taxRule?.rateBps ?? 0,
    });
  }

  // 6. Verify min quantity
  const minQty = (plan as any).minQuantity ?? 0;
  if (totalQuantity < minQty) {
    throw Object.assign(
      new Error(`Total quantity ${totalQuantity} does not meet plan minimum of ${minQty}`),
      { statusCode: 400 }
    );
  }

  // 7. Calculate expiry
  const validDays = (template as any).validDays ?? 30;
  const quoteExpiresAt = new Date(start);
  quoteExpiresAt.setDate(quoteExpiresAt.getDate() + validDays);

  // 8. Generate subscription number
  const subscriptionNo = generateSubscriptionNo();

  // 9. Determine billing interval
  const billingInterval = (plan as any).billingInterval ?? (plan as any).interval ?? 'MONTHLY';

  // 10. Create the subscription
  const subscription = await prisma.subscription.create({
    data: {
      subscriptionNo,
      customerId,
      planId: (plan as any).id,
      createdByUserId: user.id,
      status: 'QUOTATION',
      startDate: start,
      expiresAt: null,
      nextBillingAt: start,
      paymentTermsDays: paymentTermsDays ?? 15,
      planNameSnapshot: (plan as any).name ?? '',
      planPricePaise: (plan as any).pricePaise ?? (plan as any).basePricePaise ?? 0,
      billingInterval,
      planTaxNameSnapshot: (plan as any).taxRule?.name ?? null,
      planTaxRateBps: (plan as any).taxRule?.rateBps ?? 0,
      autoCloseAtEnd: (plan as any).autoCloseAtEnd ?? false,
      canCloseEarly: (plan as any).canCloseEarly ?? true,
      canPause: (plan as any).canPause ?? false,
      canRenew: (plan as any).canRenew ?? true,
      recurringTotalPaise,
      quoteExpiresAt,
      lines: {
        create: lineData,
      },
    },
    include: {
      lines: true,
      customer: true,
      plan: true,
    },
  });

  return subscription;
}
