/**
 * Pure Financial Calculation Engine for Invoices
 * 
 * Strict integer paise arithmetic with zero floating-point imprecision.
 * Handles:
 * - Line item creation (plan + product lines)
 * - Proportional discount allocation with remainder distribution
 * - Product-scoped and subscription-scoped discounts
 * - Tax computation using basis points (e.g. 1800 bps = 18%)
 * - Subtotal, discount, taxable, tax, and final totals
 */

export interface LineInput {
  productId?: string | null;
  descriptionSnapshot: string;
  quantity: number;
  unitPricePaise: number;
  taxRateBps: number;
  taxNameSnapshot?: string | null;
  skuSnapshot?: string | null;
  variantSnapshot?: string | null;
}

export interface DiscountRuleInput {
  id: string;
  name: string;
  type: 'FIXED' | 'PERCENTAGE';
  scope: 'PRODUCT' | 'SUBSCRIPTION';
  value: number; // paise for FIXED, basis points (0..10000) for PERCENTAGE
  minPurchasePaise?: number;
  minQuantity?: number;
  eligibleProductIds?: string[];
}

export interface CalculatedInvoiceLine {
  productId?: string | null;
  descriptionSnapshot: string;
  quantity: number;
  unitPricePaise: number;
  subtotalPaise: number;
  discountPaise: number;
  taxablePaise: number;
  taxRateBps: number;
  taxPaise: number;
  totalPaise: number;
}

export interface CalculatedInvoiceTotals {
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number;
  totalPaise: number;
  appliedDiscountRule?: {
    id: string;
    name: string;
  } | null;
  lines: CalculatedInvoiceLine[];
}

export interface SubscriptionSnapshotInput {
  planNameSnapshot: string;
  planPricePaise: number;
  planTaxRateBps: number;
  planTaxNameSnapshot?: string | null;
  lines: LineInput[];
}

/**
 * Distributes a discount total across a list of eligible lines proportionally,
 * resolving integer rounding remainder deterministically (largest remainder first).
 */
export function allocateDiscountProportionally(
  lineSubtotals: number[],
  totalDiscount: number,
  eligibleTotal: number
): number[] {
  if (totalDiscount <= 0 || eligibleTotal <= 0 || lineSubtotals.length === 0) {
    return lineSubtotals.map(() => 0);
  }

  // Cap discount at eligible total
  const cappedDiscount = Math.min(totalDiscount, eligibleTotal);

  // First pass: floor division & keep track of fractional remainders
  const allocations: number[] = [];
  const remainders: { index: number; remainder: number }[] = [];
  let allocatedSum = 0;

  for (let i = 0; i < lineSubtotals.length; i++) {
    const subtotal = lineSubtotals[i];
    if (subtotal <= 0) {
      allocations.push(0);
      continue;
    }
    // subtotal * cappedDiscount / eligibleTotal
    const exact = (subtotal * cappedDiscount) / eligibleTotal;
    const floored = Math.floor(exact);
    allocations.push(floored);
    allocatedSum += floored;
    remainders.push({
      index: i,
      remainder: exact - floored,
    });
  }

  // Second pass: distribute the leftover paise by highest remainder first
  let remainingPaise = cappedDiscount - allocatedSum;
  // Sort descending by remainder, secondary sort by index
  remainders.sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  for (let i = 0; i < remainders.length && remainingPaise > 0; i++) {
    allocations[remainders[i].index] += 1;
    remainingPaise -= 1;
  }

  return allocations;
}

/**
 * Evaluates whether a discount rule is eligible for a set of items,
 * and calculates the exact discount in paise.
 */
export function evaluateDiscountSavings(
  rule: DiscountRuleInput,
  planSubtotal: number,
  productLines: LineInput[]
): {
  isEligible: boolean;
  totalSavingsPaise: number;
  ineligibilityReason?: string;
  eligibleLineIndices: number[]; // index 0 is plan line, 1..N are product lines
} {
  // Line 0 is plan, Lines 1..N are product lines
  const allSubtotals: number[] = [
    planSubtotal,
    ...productLines.map((l) => l.quantity * l.unitPricePaise),
  ];
  const totalQuantity = 1 + productLines.reduce((sum, l) => sum + l.quantity, 0);
  const totalSubtotal = allSubtotals.reduce((sum, s) => sum + s, 0);

  // Check minimum purchase
  if (rule.minPurchasePaise && rule.minPurchasePaise > 0) {
    if (totalSubtotal < rule.minPurchasePaise) {
      return {
        isEligible: false,
        totalSavingsPaise: 0,
        ineligibilityReason: `Subtotal ${totalSubtotal} paise is below min purchase of ${rule.minPurchasePaise} paise`,
        eligibleLineIndices: [],
      };
    }
  }

  // Check minimum quantity
  if (rule.minQuantity && rule.minQuantity > 0) {
    if (totalQuantity < rule.minQuantity) {
      return {
        isEligible: false,
        totalSavingsPaise: 0,
        ineligibilityReason: `Quantity ${totalQuantity} is below min quantity of ${rule.minQuantity}`,
        eligibleLineIndices: [],
      };
    }
  }

  if (rule.scope === 'SUBSCRIPTION') {
    // Subscription-wide: applies to plan line + all product lines
    const eligibleIndices = allSubtotals.map((_, i) => i);
    let savings = 0;

    if (rule.type === 'PERCENTAGE') {
      const bps = Math.min(10000, Math.max(0, rule.value));
      savings = Math.round((totalSubtotal * bps) / 10000);
    } else {
      // FIXED in paise
      savings = Math.max(0, rule.value);
    }

    savings = Math.min(savings, totalSubtotal);

    return {
      isEligible: savings > 0,
      totalSavingsPaise: savings,
      eligibleLineIndices: eligibleIndices,
    };
  }

  if (rule.scope === 'PRODUCT') {
    // Product-specific: applies only to matching product lines
    const eligibleProductIds = new Set(rule.eligibleProductIds || []);
    if (eligibleProductIds.size === 0) {
      return {
        isEligible: false,
        totalSavingsPaise: 0,
        ineligibilityReason: 'Product discount has no eligible products configured',
        eligibleLineIndices: [],
      };
    }

    const eligibleIndices: number[] = [];
    let eligibleSubtotal = 0;
    let eligibleQuantity = 0;

    // Check each product line (indices 1..N)
    productLines.forEach((line, idx) => {
      if (line.productId && eligibleProductIds.has(line.productId)) {
        eligibleIndices.push(idx + 1); // +1 because 0 is plan line
        eligibleSubtotal += line.quantity * line.unitPricePaise;
        eligibleQuantity += line.quantity;
      }
    });

    if (eligibleIndices.length === 0 || eligibleSubtotal <= 0) {
      return {
        isEligible: false,
        totalSavingsPaise: 0,
        ineligibilityReason: 'No matching products found in subscription',
        eligibleLineIndices: [],
      };
    }

    // Check min quantity on matching product items specifically if required
    if (rule.minQuantity && rule.minQuantity > 0 && eligibleQuantity < rule.minQuantity) {
      return {
        isEligible: false,
        totalSavingsPaise: 0,
        ineligibilityReason: `Matching product quantity ${eligibleQuantity} is below min quantity ${rule.minQuantity}`,
        eligibleLineIndices: [],
      };
    }

    let savings = 0;
    if (rule.type === 'PERCENTAGE') {
      const bps = Math.min(10000, Math.max(0, rule.value));
      savings = Math.round((eligibleSubtotal * bps) / 10000);
    } else {
      savings = Math.max(0, rule.value);
    }

    savings = Math.min(savings, eligibleSubtotal);

    return {
      isEligible: savings > 0,
      totalSavingsPaise: savings,
      eligibleLineIndices: eligibleIndices,
    };
  }

  return {
    isEligible: false,
    totalSavingsPaise: 0,
    ineligibilityReason: `Unknown discount scope: ${rule.scope}`,
    eligibleLineIndices: [],
  };
}

/**
 * Selects the single best non-stacking discount rule that produces the largest savings.
 */
export function selectBestDiscountRule(
  candidateRules: DiscountRuleInput[],
  planSubtotal: number,
  productLines: LineInput[]
): {
  selectedRule: DiscountRuleInput | null;
  savingsPaise: number;
  eligibleLineIndices: number[];
} {
  let bestRule: DiscountRuleInput | null = null;
  let maxSavings = 0;
  let bestEligibleIndices: number[] = [];

  for (const rule of candidateRules) {
    const evalResult = evaluateDiscountSavings(rule, planSubtotal, productLines);
    if (evalResult.isEligible && evalResult.totalSavingsPaise > maxSavings) {
      maxSavings = evalResult.totalSavingsPaise;
      bestRule = rule;
      bestEligibleIndices = evalResult.eligibleLineIndices;
    }
  }

  return {
    selectedRule: bestRule,
    savingsPaise: maxSavings,
    eligibleLineIndices: bestEligibleIndices,
  };
}

/**
 * Pure calculation function that generates invoice lines and totals from snapshots.
 */
export function calculateInvoice(
  subscription: SubscriptionSnapshotInput,
  appliedDiscount?: {
    rule: DiscountRuleInput;
    savingsPaise: number;
    eligibleLineIndices: number[];
  } | null
): CalculatedInvoiceTotals {
  // 1. Prepare raw items
  // Line 0: Plan line
  const rawItems: {
    productId?: string | null;
    descriptionSnapshot: string;
    quantity: number;
    unitPricePaise: number;
    taxRateBps: number;
  }[] = [
    {
      productId: null,
      descriptionSnapshot: `Subscription plan - ${subscription.planNameSnapshot}`,
      quantity: 1,
      unitPricePaise: subscription.planPricePaise,
      taxRateBps: subscription.planTaxRateBps || 0,
    },
    ...subscription.lines.map((l) => ({
      productId: l.productId || null,
      descriptionSnapshot: l.descriptionSnapshot,
      quantity: l.quantity,
      unitPricePaise: l.unitPricePaise,
      taxRateBps: l.taxRateBps || 0,
    })),
  ];

  const lineSubtotals = rawItems.map((item) => item.quantity * item.unitPricePaise);
  const totalSubtotal = lineSubtotals.reduce((sum, s) => sum + s, 0);

  // 2. Allocate discounts
  const lineDiscounts = rawItems.map(() => 0);

  if (appliedDiscount && appliedDiscount.savingsPaise > 0) {
    const eligibleIndices = appliedDiscount.eligibleLineIndices;
    const eligibleSubtotals = eligibleIndices.map((idx) => lineSubtotals[idx]);
    const eligibleTotal = eligibleSubtotals.reduce((sum, s) => sum + s, 0);

    const allocations = allocateDiscountProportionally(
      eligibleSubtotals,
      appliedDiscount.savingsPaise,
      eligibleTotal
    );

    eligibleIndices.forEach((lineIdx, i) => {
      lineDiscounts[lineIdx] = allocations[i];
    });
  }

  // 3. Compute tax and line totals
  const calculatedLines: CalculatedInvoiceLine[] = rawItems.map((item, i) => {
    const subtotal = lineSubtotals[i];
    const discount = lineDiscounts[i];
    const taxable = Math.max(0, subtotal - discount);
    // line tax = Math.round(taxable amount * taxRateBps / 10000)
    const tax = Math.round((taxable * (item.taxRateBps || 0)) / 10000);
    const total = taxable + tax;

    return {
      productId: item.productId,
      descriptionSnapshot: item.descriptionSnapshot,
      quantity: item.quantity,
      unitPricePaise: item.unitPricePaise,
      subtotalPaise: subtotal,
      discountPaise: discount,
      taxablePaise: taxable,
      taxRateBps: item.taxRateBps,
      taxPaise: tax,
      totalPaise: total,
    };
  });

  // 4. Summarize invoice totals
  const subtotalPaise = totalSubtotal;
  const discountPaise = calculatedLines.reduce((sum, l) => sum + l.discountPaise, 0);
  const taxPaise = calculatedLines.reduce((sum, l) => sum + l.taxPaise, 0);
  const totalPaise = subtotalPaise - discountPaise + taxPaise;

  return {
    subtotalPaise,
    discountPaise,
    taxPaise,
    totalPaise,
    appliedDiscountRule: appliedDiscount?.rule
      ? {
          id: appliedDiscount.rule.id,
          name: appliedDiscount.rule.name,
        }
      : null,
    lines: calculatedLines,
  };
}
