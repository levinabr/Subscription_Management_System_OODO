import { describe, it, expect } from 'vitest';
import {
  calculateInvoice,
  allocateDiscountProportionally,
  evaluateDiscountSavings,
  selectBestDiscountRule,
  DiscountRuleInput,
} from '@/lib/billing/invoice-calculator';

describe('Invoice Calculation and Financial Engine', () => {
  const baseSubscription = {
    planNameSnapshot: 'Enterprise Plan',
    planPricePaise: 56000, // ₹560.00
    planTaxRateBps: 1800, // 18.00%
    planTaxNameSnapshot: 'GST 18%',
    lines: [
      {
        productId: 'prod_seat',
        descriptionSnapshot: 'User Seat Add-on',
        quantity: 5,
        unitPricePaise: 12000, // ₹120.00 each
        taxRateBps: 1800, // 18%
        skuSnapshot: 'SEAT-1',
      },
      {
        productId: 'prod_storage',
        descriptionSnapshot: 'Additional 100GB Storage',
        quantity: 2,
        unitPricePaise: 25000, // ₹250.00 each
        taxRateBps: 1800, // 18%
        skuSnapshot: 'STOR-100',
      },
    ],
  };

  it('correctly calculates plan charge and product line subtotals without discount', () => {
    const result = calculateInvoice(baseSubscription);

    // Plan line: 1 * 56000 = 56000
    // Seat line: 5 * 12000 = 60000
    // Storage line: 2 * 25000 = 50000
    // Subtotal = 56000 + 60000 + 50000 = 166000 (₹1,660.00)
    expect(result.subtotalPaise).toBe(166000);
    expect(result.discountPaise).toBe(0);

    // Lines check
    expect(result.lines).toHaveLength(3);
    expect(result.lines[0].descriptionSnapshot).toBe('Subscription plan - Enterprise Plan');
    expect(result.lines[0].subtotalPaise).toBe(56000);
    expect(result.lines[1].subtotalPaise).toBe(60000);
    expect(result.lines[2].subtotalPaise).toBe(50000);
  });

  it('correctly calculates tax using integer basis points arithmetic', () => {
    const result = calculateInvoice(baseSubscription);

    // Line 0 tax: 56000 * 1800 / 10000 = 10080
    // Line 1 tax: 60000 * 1800 / 10000 = 10800
    // Line 2 tax: 50000 * 1800 / 10000 = 9000
    // Tax total = 10080 + 10800 + 9000 = 29880 (₹298.80)
    expect(result.lines[0].taxPaise).toBe(10080);
    expect(result.lines[1].taxPaise).toBe(10800);
    expect(result.lines[2].taxPaise).toBe(9000);
    expect(result.taxPaise).toBe(29880);

    // Total = 166000 + 29880 = 195880
    expect(result.totalPaise).toBe(195880);
  });

  describe('Discounts & Eligibility', () => {
    it('applies a subscription-wide percentage discount (15% = 1500 bps)', () => {
      const discountRule: DiscountRuleInput = {
        id: 'disc_15',
        name: 'Festive 15% Off',
        type: 'PERCENTAGE',
        scope: 'SUBSCRIPTION',
        value: 1500, // 15%
      };

      const evalResult = evaluateDiscountSavings(discountRule, 56000, baseSubscription.lines);
      expect(evalResult.isEligible).toBe(true);
      // 166000 * 1500 / 10000 = 24900 paise (₹249.00)
      expect(evalResult.totalSavingsPaise).toBe(24900);

      const invoice = calculateInvoice(baseSubscription, {
        rule: discountRule,
        savingsPaise: evalResult.totalSavingsPaise,
        eligibleLineIndices: evalResult.eligibleLineIndices,
      });

      expect(invoice.subtotalPaise).toBe(166000);
      expect(invoice.discountPaise).toBe(24900);

      // Verify proportional distribution sum equals exact total discount
      const sumLineDiscounts = invoice.lines.reduce((sum, l) => sum + l.discountPaise, 0);
      expect(sumLineDiscounts).toBe(24900);

      // Verify invoice total consistency: subtotal - discount + tax = total
      expect(invoice.totalPaise).toBe(invoice.subtotalPaise - invoice.discountPaise + invoice.taxPaise);
    });

    it('applies a subscription-wide fixed discount (₹200 = 20000 paise)', () => {
      const discountRule: DiscountRuleInput = {
        id: 'disc_fixed_200',
        name: 'Flat ₹200 Off',
        type: 'FIXED',
        scope: 'SUBSCRIPTION',
        value: 20000, // ₹200.00
      };

      const evalResult = evaluateDiscountSavings(discountRule, 56000, baseSubscription.lines);
      expect(evalResult.isEligible).toBe(true);
      expect(evalResult.totalSavingsPaise).toBe(20000);

      const invoice = calculateInvoice(baseSubscription, {
        rule: discountRule,
        savingsPaise: evalResult.totalSavingsPaise,
        eligibleLineIndices: evalResult.eligibleLineIndices,
      });

      expect(invoice.discountPaise).toBe(20000);
      const sumLineDiscounts = invoice.lines.reduce((sum, l) => sum + l.discountPaise, 0);
      expect(sumLineDiscounts).toBe(20000);
    });

    it('caps a subscription-wide fixed discount at the eligible subtotal', () => {
      const hugeDiscount: DiscountRuleInput = {
        id: 'disc_huge',
        name: 'Huge ₹10,000 Off',
        type: 'FIXED',
        scope: 'SUBSCRIPTION',
        value: 1000000, // ₹10,000.00
      };

      const evalResult = evaluateDiscountSavings(hugeDiscount, 56000, baseSubscription.lines);
      expect(evalResult.isEligible).toBe(true);
      // Capped at total subtotal 166000
      expect(evalResult.totalSavingsPaise).toBe(166000);

      const invoice = calculateInvoice(baseSubscription, {
        rule: hugeDiscount,
        savingsPaise: evalResult.totalSavingsPaise,
        eligibleLineIndices: evalResult.eligibleLineIndices,
      });

      expect(invoice.discountPaise).toBe(166000);
      expect(invoice.taxPaise).toBe(0); // 0 taxable amount = 0 tax
      expect(invoice.totalPaise).toBe(0);
    });

    it('applies a product-specific discount only to matching product lines', () => {
      const productDiscount: DiscountRuleInput = {
        id: 'disc_seat_promo',
        name: 'Seat Promo 20%',
        type: 'PERCENTAGE',
        scope: 'PRODUCT',
        value: 2000, // 20%
        eligibleProductIds: ['prod_seat'], // Only applies to user seats
      };

      const evalResult = evaluateDiscountSavings(productDiscount, 56000, baseSubscription.lines);
      expect(evalResult.isEligible).toBe(true);
      // Seat subtotal = 60000. 20% of 60000 = 12000 paise (₹120.00)
      expect(evalResult.totalSavingsPaise).toBe(12000);

      const invoice = calculateInvoice(baseSubscription, {
        rule: productDiscount,
        savingsPaise: evalResult.totalSavingsPaise,
        eligibleLineIndices: evalResult.eligibleLineIndices,
      });

      expect(invoice.discountPaise).toBe(12000);
      // Plan line discount must be 0
      expect(invoice.lines[0].discountPaise).toBe(0);
      // Seat line discount must be 12000
      expect(invoice.lines[1].discountPaise).toBe(12000);
      // Storage line discount must be 0
      expect(invoice.lines[2].discountPaise).toBe(0);

      // Verify taxable and tax for seat line
      // taxable = 60000 - 12000 = 48000
      // tax = 48000 * 1800 / 10000 = 8640
      expect(invoice.lines[1].taxablePaise).toBe(48000);
      expect(invoice.lines[1].taxPaise).toBe(8640);
      expect(invoice.lines[1].totalPaise).toBe(48000 + 8640);
    });

    it('enforces minimum purchase condition', () => {
      const discountWithMin: DiscountRuleInput = {
        id: 'disc_min_purch',
        name: 'Min ₹2,000 Purchase',
        type: 'PERCENTAGE',
        scope: 'SUBSCRIPTION',
        value: 1000,
        minPurchasePaise: 200000, // ₹2,000.00 (subtotal is 166000)
      };

      const evalResult = evaluateDiscountSavings(discountWithMin, 56000, baseSubscription.lines);
      expect(evalResult.isEligible).toBe(false);
      expect(evalResult.totalSavingsPaise).toBe(0);
      expect(evalResult.ineligibilityReason).toContain('below min purchase');
    });

    it('enforces minimum quantity condition', () => {
      const discountWithMinQty: DiscountRuleInput = {
        id: 'disc_min_qty',
        name: 'Min 10 Seats',
        type: 'PERCENTAGE',
        scope: 'PRODUCT',
        value: 1500,
        minQuantity: 10,
        eligibleProductIds: ['prod_seat'], // Currently 5 seats
      };

      const evalResult = evaluateDiscountSavings(discountWithMinQty, 56000, baseSubscription.lines);
      expect(evalResult.isEligible).toBe(false);
      expect(evalResult.totalSavingsPaise).toBe(0);
      expect(evalResult.ineligibilityReason).toContain('below min quantity');
    });

    it('selects the single best non-stacking discount producing maximum savings', () => {
      const candidateRules: DiscountRuleInput[] = [
        {
          id: 'rule_10pct',
          name: '10% Off All',
          type: 'PERCENTAGE',
          scope: 'SUBSCRIPTION',
          value: 1000, // 10% of 166000 = 16600 paise
        },
        {
          id: 'rule_fixed_150',
          name: 'Flat ₹150 Off',
          type: 'FIXED',
          scope: 'SUBSCRIPTION',
          value: 15000, // 15000 paise
        },
        {
          id: 'rule_seat_50pct',
          name: '50% Off Seats',
          type: 'PERCENTAGE',
          scope: 'PRODUCT',
          value: 5000, // 50% of 60000 = 30000 paise
          eligibleProductIds: ['prod_seat'],
        },
      ];

      const best = selectBestDiscountRule(candidateRules, 56000, baseSubscription.lines);
      expect(best.selectedRule?.id).toBe('rule_seat_50pct');
      expect(best.savingsPaise).toBe(30000); // 30000 > 16600 > 15000
    });
  });

  describe('Deterministic Remainder Distribution', () => {
    it('distributes odd fractional cents deterministically so sum of parts equals total discount', () => {
      // 3 lines with subtotals 10000, 10000, 10000 (total 30000)
      // total discount: 1000 paise (₹10.00)
      // 1000 / 3 = 333.333333...
      // floors: 333, 333, 333 (sum 999) -> remainder 1 paise distributed to index 0
      const allocations = allocateDiscountProportionally([10000, 10000, 10000], 1000, 30000);
      expect(allocations).toEqual([334, 333, 333]);
      expect(allocations.reduce((a, b) => a + b, 0)).toBe(1000);
    });
  });
});
